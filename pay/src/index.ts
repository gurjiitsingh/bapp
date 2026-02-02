import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Import PayPal SDK classes
import { PayPalHttpClient, SandboxEnvironment } from "@paypal/paypal-server-sdk";
import { OrdersCreateRequest } from "@paypal/paypal-server-sdk";

admin.initializeApp();

// PayPal credentials
const clientId = "YOUR_CLIENT_ID";
const clientSecret = "YOUR_CLIENT_SECRET";

// Environment & client
const environment = new SandboxEnvironment(clientId, clientSecret);
const client = new PayPalHttpClient(environment);

// Firebase function to create a PayPal order
export const createPayPalOrder = functions.https.onRequest(async (req, res) => {
  try {
    const request = new OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "10.00", // replace with actual order amount
          },
        },
      ],
    });

    const response = await client.execute(request);
    res.json(response.result);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});
