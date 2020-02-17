# our web app framework!

# you could also generate a skeleton from scratch via
# http://flask-appbuilder.readthedocs.io/en/latest/installation.html
# Import libraries
import os,cv2
import numpy as np
import matplotlib.pyplot as plt

from sklearn.utils import shuffle
from sklearn.model_selection import train_test_split

from keras import backend as K
K.set_session
K.tensorflow_backend.set_image_dim_ordering('th')

from keras.utils import np_utils
from keras.models import Sequential
from keras.layers.core import Dense, Dropout, Activation, Flatten
from keras.layers.convolutional import Convolution2D, MaxPooling2D
from keras.models import load_model



# Generating HTML from within Python is not fun, and actually pretty cumbersome because you have to do the
# HTML escaping on your own to keep the application secure. Because of that Flask configures the Jinja2 template engine
# for you automatically.
# requests are objects that flask handles (get set post, etc)
from flask import Flask, render_template, request
# scientific computing library for saving, reading, and resizing images
from scipy.misc import imsave, imread, imresize
# for matrix math
import numpy as np
# for importing our keras model
import keras.models
# for regular expressions, saves time dealing with string data
import re
import cv2
# system level operations (like loading files)
import sys
# for reading operating system data
import os
# tell our app where our saved model is
from model.load import init

sys.path.append(os.path.abspath('./model'))
from load import *

# initalize our flask app
app = Flask(__name__)
# global vars for easy reusability
global model, graph
# initialize these variables
model, graph = init()

# decoding an image from base64 into raw representation
import base64

def convertImage(imgData1):
    imgstr = re.search(b'data:image/png;base64,(.*)', imgData1).group(1)
    with open('output.png', 'wb') as output:
        output.write(base64.b64decode(imgstr))


@app.route('/')
def index():
	# initModel()
	# render out pre-built HTML file right on the index page
	return render_template("index.html")


@app.route('/predict/', methods=['GET', 'POST'])
def predict():
	"""
	Created on Thu May  4 23:32:34 2019
	@author saad
	"""
	imgData = request.get_data()
	# encode it into a suitable format
	convertImage(imgData)
	# print "debug"
	# read the image into memory
	x = imread('output.png', mode='L')

	# Testing a new image
	test_image = cv2.imread('output.png')
	test_image = cv2.cvtColor(test_image, cv2.COLOR_BGR2GRAY)
	test_image = cv2.resize(test_image, (128, 128))
	# test_image = cv2.resize(test_image, (28, 28))




	test_image = np.array(test_image)
	test_image = test_image.astype('float32')
	test_image /= 255
	print(test_image.shape)
	num_channel = 1
	if num_channel == 1:
		if K.tensorflow_backend.image_dim_ordering() == 'th':
			test_image = np.expand_dims(test_image, axis=0)
			print(test_image.shape)
			test_image = np.expand_dims(test_image, axis=0)
			print(test_image.shape)
		else:
			test_image = np.expand_dims(test_image, axis=3)
			test_image = np.expand_dims(test_image, axis=0)
			print(test_image.shape)

	else:
		if K.image_dim_ordering() == 'th':
			test_image = np.rollaxis(test_image, 2, 0)
			print(test_image.shape)
			test_image = np.expand_dims(test_image, axis=0)
			print(test_image.shape)
		else:
			test_image = np.expand_dims(test_image, axis=0)
			print(test_image.shape)

	# Predicting the test image
	# test_image = test_image.reshape((-1, 28, 28, 1))
	with graph.as_default():
		# perform the prediction
		print((model.predict(test_image)))
		print(model.predict_classes(test_image))
		out =model.predict_classes(test_image)

		# print(out)
		# print(np.argmax(out,axis=1))
		# print "debug3"
		# convert the response to a string
		# convert the response to a string

		response = ' '.join(map(str, out))
		print(response)

		with open('C:/Users/qwerty/PycharmProjects/scratches/data/data/'+response+'.jpeg', "rb") as f:
    				response= base64.b64encode(f.read())
		return response


if __name__ == "__main__":
	# decide what port to run the app in
	port = int(os.environ.get('PORT', 5000))
	# run the app locally on the givn port
	app.run(host='0.0.0.0', port=port)
# optional if we want to run in debugging mode
# app.run(debug=True)
