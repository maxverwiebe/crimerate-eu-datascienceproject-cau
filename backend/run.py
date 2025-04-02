from app import create_app

app = create_app()

# runs the dev server
if __name__ == '__main__':
    app.run(debug=True)
