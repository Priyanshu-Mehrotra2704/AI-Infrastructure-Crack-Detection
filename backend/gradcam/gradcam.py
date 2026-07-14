import tensorflow as tf
import numpy as np
import cv2
import tensorflow as tf
print(tf.__version__)
print(tf.keras.__version__)


def make_gradcam_heatmap(img_array, model):

    # Build model once if needed
    if not model.built:
        model.build((None, 224, 224, 3))

    # Run one forward pass
    _ = model(img_array, training=False)

    grad_model = tf.keras.models.Model(
        inputs=model.inputs,
        outputs=[
            model.get_layer("last_conv_layer").output,
            model.outputs[0]
        ]
    )

    with tf.GradientTape() as tape:

        conv_outputs, predictions = grad_model(
            img_array,
            training=False
        )

        loss = predictions[:, 0]

    grads = tape.gradient(loss, conv_outputs)
    print("Gradient:",grads)

    pooled_grads = tf.reduce_mean(
        grads,
        axis=(0, 1, 2)
    )

    conv_outputs = conv_outputs[0]

    heatmap = tf.reduce_sum(
        conv_outputs * pooled_grads,
        axis=-1
    )

    heatmap = tf.maximum(heatmap, 0)

    max_val = tf.reduce_max(heatmap)

    if max_val != 0:
        heatmap = heatmap / max_val

    return heatmap.numpy()


def save_gradcam(img_path, heatmap, output_path):

    image = cv2.imread(img_path)

    image = cv2.resize(
        image,
        (224, 224)
    )

    heatmap = np.uint8(255 * heatmap)

    heatmap = cv2.applyColorMap(
        heatmap,
        cv2.COLORMAP_JET
    )

    superimposed = cv2.addWeighted(
        image,
        0.6,
        heatmap,
        0.4,
        0
    )

    cv2.imwrite(
        output_path,
        superimposed
    )

    return output_path