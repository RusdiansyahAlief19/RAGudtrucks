import pickle
import numpy as np

class DummyPoly:
    def transform(self, X):
        return X

class DummyModel:
    def predict(self, X):
        return [np.random.uniform(60, 95)]

d = {'poly': DummyPoly(), 'model': DummyModel()}
pickle.dump(d, open('backend/models/model_aki.pkl', 'wb'))
print("Dummy model_aki.pkl created.")
