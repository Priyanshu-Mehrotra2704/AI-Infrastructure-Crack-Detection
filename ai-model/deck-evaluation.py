import numpy as np
from tensorflow.keras.models import load_model
from sklearn.metrics import classification_report, confusion_matrix

from deck_data_pipeline import load_dataset

# =====================================================
# Load Dataset (same split as training, same SEED, so
# X_test / y_test here match what the model was validated
# on during training)
# =====================================================

X_train, X_test, y_train, y_test = load_dataset()

# =====================================================
# Load Trained Model
# =====================================================
# Point this at whichever saved file you want to evaluate:
#   - "models/deck_best_model.keras"  -> best checkpoint (by val_loss)
#   - "models/deck_model.keras"       -> final model after Phase 2
MODEL_PATH = "models/deck_best_model_focal.keras"

model = load_model(MODEL_PATH)
print(f"Loaded model from: {MODEL_PATH}")

# =====================================================
# Standard Evaluation
# =====================================================

loss, accuracy = model.evaluate(X_test, y_test, verbose=0)

print("\n===============================")
print(f"Test Accuracy : {accuracy*100:.2f}%")
print(f"Test Loss     : {loss:.4f}")
print("===============================")

# =====================================================
# Per-Class Metrics
# =====================================================

y_pred_probs = model.predict(X_test, verbose=0)
y_pred = (y_pred_probs > 0.5).astype(int).flatten()

print("\n----- Confusion Matrix -----")
print("(rows = actual, cols = predicted)")
print(confusion_matrix(y_test, y_pred))

print("\n----- Classification Report -----")
print(classification_report(
    y_test, y_pred, target_names=["Uncracked", "Cracked"]
))

# =====================================================
# Threshold Sensitivity (optional but useful)
# =====================================================
# If Cracked recall looks low at threshold 0.5, try lowering it.
# This shows how precision/recall trade off at a few thresholds
# without needing to retrain anything.

print("\n----- Threshold Sensitivity (Cracked class) -----")
print(f"{'Threshold':<12}{'Precision':<12}{'Recall':<12}{'F1':<12}")

from sklearn.metrics import precision_recall_fscore_support

for threshold in [0.3, 0.4, 0.5, 0.6, 0.7]:
    y_pred_t = (y_pred_probs > threshold).astype(int).flatten()
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_test, y_pred_t, average=None, labels=[1], zero_division=0
    )
    print(f"{threshold:<12}{precision[0]:<12.4f}{recall[0]:<12.4f}{f1[0]:<12.4f}")