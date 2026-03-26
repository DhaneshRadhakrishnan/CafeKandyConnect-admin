const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();

exports.onOrderStatusUpdate = onDocumentUpdated("orders/{orderId}", async (event) => {
    const newValue = event.data.after.data();
    const previousValue = event.data.before.data();

    // Only trigger if status changed to DELIVERED
    if (newValue.status !== previousValue.status) {
        const userId = newValue.userId;
        const orderId = newValue.orderId;

        try {
            // 1. Fetch the user's FCM token from the 'users' collection
            const userDoc = await getFirestore().collection("users").doc(userId).get();
            const fcmToken = userDoc.data()?.fcmToken;

            if (!fcmToken) {
                console.log(`No FCM token found for user: ${userId}`);
                return null;
            }

            // 2. Construct the message for FCM V1
            const message = {
                token: fcmToken,
                notification: {
                    title: "Order Delivered! ☕",
                    body: `Your order ${orderId} is on its way.`,
                },
                android: {
                    priority: "high",
                    notification: {
                        channel_id: "orders_channel", // Ensure this matches your Android Channel ID
                        icon: "ic_launcher",
                        color: "#7e5233"
                    }
                }
            };

            // 3. Send the notification
            const response = await getMessaging().send(message);
            console.log("Successfully sent message:", response);
        } catch (error) {
            console.error("Error sending notification:", error);
        }
    }
    return null;
});