from flask import Flask
from flask import render_template


app = Flask(__name__)

@app.route('/pattern/edit')
def edit():
  return render_template('edit_pattern.html')


@app.route('/')
def hello():
  return render_template('index.html')

if __name__ == '__main__':
  app.run(debug=True)
