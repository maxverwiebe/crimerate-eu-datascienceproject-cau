import os
import pickle
import requests
import pandas as pd
import itertools
from datetime import datetime

def _make_hashable(obj):
    """Unfortunately lists are not hashable in python, so we need to convert them to tuples"""
    if isinstance(obj, list):
        return tuple(_make_hashable(item) for item in obj)
    elif isinstance(obj, dict):
        return tuple((k, _make_hashable(v)) for k, v in sorted(obj.items()))
    else:
        return obj

class EurostatDataLoader:
    def __init__(self, cache_file='eurostat_cache.pkl', cache_expiry=3600):
        """
        Initializes the loader
        
        Args:
            cache_file (str): Path to the cache file
            cache_expiry (int): Cache expiry time in seconds (default: 1 hour)
        """
        self.cache_file = cache_file
        self.cache_expiry = cache_expiry # seconds
        self.cache = {}
        self._load_cache()
    
    def _load_cache(self):
        """Loads cached data from disk if available"""
        if os.path.exists(self.cache_file):
            with open(self.cache_file, 'rb') as f:
                self.cache = pickle.load(f)
        else:
            self.cache = {}
    
    def _save_cache(self):
        """Saves the current cache to disk as a python pickle (.pkl) file"""
        with open(self.cache_file, 'wb') as f:
            pickle.dump(self.cache, f)
    
    def fetch_dataset(self, dataset_code, params=None):
        """
        Fetches the dataset JSON from the Eurostat API & using caching
        
        Args:
            dataset_code (str): The Eurostat dataset code
            params (dict): Additional parameters for the request
            
        Returns:
            dict: The JSON data returned by the API :D
        """
        if params is None:
            params = {'format': 'json'}
        else:
            params.setdefault('format', 'json')
        
        # generating the hashed key for the cache
        # TODO: make this more robust / maybe use a string hash idk
        hashable_params = _make_hashable(params) # example: (('format', 'json'), ('time', ('2019', '2020')))
        cache_key = (dataset_code, frozenset(hashable_params)) # example: ('ilc_mddw06', frozenset({('time', ('2019', '2020')), ('format', 'json')}))
        print(hashable_params)
        print(cache_key)
        now = datetime.now()
        
        # when data is already in cache and not expired return it instead of fetching it again
        if cache_key in self.cache:
            cached_response, timestamp = self.cache[cache_key]
            if (now - timestamp).total_seconds() < self.cache_expiry:
                return cached_response
        
        url = f"https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{dataset_code}"
        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()
            # update the cache
            self.cache[cache_key] = (data, now)
            self._save_cache()
            return data
        else:
            raise Exception(f"Error fetching dataset {dataset_code}: {response.status_code}")
    
    def parse_data(self, data):
        """
        Parses the JSON data into a pandas df.
        
        Args:
            data (dict): The JSON data from the Eurostat API
            
        Returns:
            pd.DataFrame
        """

        if 'dimension' not in data:
            raise Exception("Invalid data format: 'dimension' not found.")
        
        # order of dimensions to keep order
        if 'id' in data['dimension']:
            dim_order = data['dimension']['id']
        else:
            dim_order = list(data['dimension'].keys())

        # create a dict with all possible values for each dimension
        dim_values = {}
        geo_map = {}
        for dim in dim_order:
            if dim in ['id', 'size']:
                continue
            category = data['dimension'][dim]['category']
            sorted_categories = sorted(category['index'].items(), key=lambda x: x[1])
            
            if dim == "geo":
                labels = [category['label'].get(k, k) for k, _ in sorted_categories]
                dim_values[dim] = labels
                geo_map = dict(zip(labels, [k for k, _ in sorted_categories]))
            else:
                dim_values[dim] = [category['label'].get(k, k) for k, _ in sorted_categories]

        # this gets us all possible combinations of the dimensions
        all_combinations = list(itertools.product(*[dim_values[dim] for dim in dim_values]))

        # get the values for each combination
        values = []
        for idx in range(len(all_combinations)):
            values.append(data['value'].get(str(idx), None))

        # create a DataFrame from the data
        df = pd.DataFrame(all_combinations, columns=list(dim_values.keys()))
        df['value'] = values

        # Falls die Dimension geo existiert, füge eine extra Spalte "geo_code" hinzu
        if "geo" in df.columns and geo_map:
            df["geo_code"] = df["geo"].map(geo_map)
        
        return df


    def load_dataset(self, dataset_code, filters=None, dimensions=None):
        """
        Loads and parses a dataset from Eurostat, with optional filtering.
        
        Args:
            dataset_code (str): The Eurostat dataset code.
            filters (dict): Additional query params like {'time': ['2019', '2020'], 'geo': 'EU27_2020'}.
            dimensions (list): List of dimensions to be included in the resulting df
            
        Returns:
            pd.DataFrame
        """
        params = {'format': 'json'}
        if filters:
            params.update(filters)
            
        data = self.fetch_dataset(dataset_code, params)
        df = self.parse_data(data)
        
        print(set(df.columns))

        # filter the dataset for the requested dimensions of diemensions parameter
        if dimensions:
            available_dims = set(df.columns)
            selected_dims = [d for d in dimensions if d in available_dims]
            df = df[selected_dims + ['value']]
            
        return df

    def get_dimensions(self, dataset_code, filters=None):
        """
        Extracts & retrieves all dimensions from a Eurostat dataset.
        """
        
        params = {'format': 'json'}
        if filters:
            params.update(filters)
            
        data = self.fetch_dataset(dataset_code, params)
        dimensions = {}
        if 'id' in data['dimension']:
            dim_order = data['dimension']['id']
        else:
            dim_order = list(data['dimension'].keys())
            
        for dim in dim_order:
            if dim in ['id', 'size']:
                continue
            dim_info = data['dimension'][dim]
            dimensions[dim] = {
                "codes": list(dim_info["category"]["index"].keys()),
                "labels": [dim_info["category"]["label"].get(code, code) for code in dim_info["category"]["index"].keys()]
            }
        return dimensions

if __name__ == '__main__':
    loader = EurostatDataLoader(cache_expiry=1800)
    
    # loads a dataset with  filters for time 2019 & 2020 as a pandas df
    df = loader.load_dataset('crim_gen_reg')
    print(df.head())
    
    # loads a dict of all available dimensions of this dataset
    # useful for some the upcoming drowndown menus for our website
    # this might need an extra API call idk
    #dims = loader.get_dimensions('ilc_mddw06')
   #print(dims.keys()) # this gets us the keys like "time", "geo" etc
    #print(dims['time']) # here we are getting all availabe years for example
