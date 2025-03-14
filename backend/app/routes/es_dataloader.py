import os
import pickle
import requests
import pandas as pd
import itertools
from datetime import datetime, timedelta

class EurostatDataLoader:
    def __init__(self, cache_file='eurostat_cache.pkl', cache_expiry=3600):
        """
        Initializes the loader with caching options.
        
        Args:
            cache_file (str): Path to the cache file.
            cache_expiry (int): Cache expiry time in seconds.
        """
        self.cache_file = cache_file
        self.cache_expiry = cache_expiry  # seconds
        self.cache = {}
        self._load_cache()
    
    def _load_cache(self):
        """Loads cached data from disk if available."""
        if os.path.exists(self.cache_file):
            with open(self.cache_file, 'rb') as f:
                self.cache = pickle.load(f)
        else:
            self.cache = {}
    
    def _save_cache(self):
        """Saves the current cache to disk."""
        with open(self.cache_file, 'wb') as f:
            pickle.dump(self.cache, f)
    
    def fetch_dataset(self, dataset_code, params=None):
        """
        Fetches the dataset JSON from the Eurostat API, using caching.
        
        Args:
            dataset_code (str): The Eurostat dataset code.
            params (dict): Additional parameters for the request.
            
        Returns:
            dict: The JSON data returned by the API.
            
        Raises:
            Exception: If the HTTP request fails.
        """
        if params is None:
            params = {'format': 'json'}
            
        # Create a cache key from the dataset code and parameters
        cache_key = (dataset_code, frozenset(params.items()))
        now = datetime.now()
        
        # Check if data exists in cache and is still valid
        if cache_key in self.cache:
            cached_response, timestamp = self.cache[cache_key]
            if (now - timestamp).total_seconds() < self.cache_expiry:
                return cached_response
        
        url = f"https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{dataset_code}"
        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()
            # Store in cache along with current timestamp
            self.cache[cache_key] = (data, now)
            self._save_cache()
            return data
        else:
            raise Exception(f"Error fetching dataset {dataset_code}: {response.status_code}")
    
    def parse_data(self, data):
        """
        Parses the JSON data into a pandas DataFrame.
        
        Args:
            data (dict): The JSON data from the Eurostat API.
            
        Returns:
            pd.DataFrame: A DataFrame containing the dataset with a 'value' column.
            
        Raises:
            Exception: If the expected 'dimension' key is not in the data.
        """
        if 'dimension' not in data:
            raise Exception("Invalid data format: 'dimension' not found.")
        
        # Get the order of dimensions
        if 'id' in data['dimension']:
            dim_order = data['dimension']['id']
        else:
            dim_order = list(data['dimension'].keys())

        # Build a dictionary of dimension values
        dim_values = {}
        for dim in dim_order:
            category = data['dimension'][dim]['category']
            sorted_categories = sorted(category['index'].items(), key=lambda x: x[1])
            dim_values[dim] = [category['label'].get(k, k) for k, _ in sorted_categories]

        # Generate all possible combinations of dimension values
        all_combinations = list(itertools.product(*[dim_values[dim] for dim in dim_order]))

        # Retrieve the data values
        values = []
        for idx in range(len(all_combinations)):
            values.append(data['value'].get(str(idx), None))

        # Build the DataFrame
        df = pd.DataFrame(all_combinations, columns=dim_order)
        df['value'] = values
        
        return df

    def load_dataset(self, dataset_code, params=None):
        """
        Loads and parses a dataset from Eurostat.
        
        Args:
            dataset_code (str): The Eurostat dataset code.
            params (dict): Additional parameters for the request.
            
        Returns:
            pd.DataFrame: A DataFrame with the dataset.
        """
        data = self.fetch_dataset(dataset_code, params)
        return self.parse_data(data)