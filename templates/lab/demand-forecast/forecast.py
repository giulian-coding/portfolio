"""Kurzfristige Nachfrage-Prognose mit einem
Gradient-Boosting-Modell auf Zeitreihen-Features."""
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error


def build_features(df):
    df = df.sort_values("ts").copy()
    df["hour"] = df["ts"].dt.hour
    df["dow"] = df["ts"].dt.dayofweek
    df["lag_1"] = df["load"].shift(1)
    df["roll_6"] = df["load"].rolling(6).mean()
    return df.dropna()


def train(df):
    feats = build_features(df)
    x = feats[["hour", "dow", "lag_1", "roll_6"]]
    y = feats["load"]
    model = GradientBoostingRegressor().fit(x, y)
    print("MAE:", mean_absolute_error(y, model.predict(x)))
    return model
