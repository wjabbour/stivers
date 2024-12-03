import axios from "axios";

function handleError(e, error_message?) {
  const message =
    e.response?.data.message ||
    error_message ||
    "Unexpected error. Please try again.";
  if (e.response) {
    return { success: null, error: { message, status: e.response.status } };
  } else {
    return { success: null, error: { message, status: 500 } };
  }
}

export async function create_order(order) {
  const body = { ...order };

  try {
    const response = await axios.post(
      "https://mxfj3q6m01.execute-api.us-east-1.amazonaws.com/v1/create-order",
      body
    );
    return { success: { data: response.data }, error: null };
  } catch (e) {
    return handleError(e);
  }
}

export async function retrieve_orders() {
  try {
    const response = await axios.get(
      "https://mxfj3q6m01.execute-api.us-east-1.amazonaws.com/v1/retrieve-orders"
    );
    return { success: { data: response.data }, error: null };
  } catch (e) {
    return handleError(e);
  }
}

export async function capture_order(order_id) {
  const body = { order_id };

  try {
    const response = await axios.post(
      "https://mxfj3q6m01.execute-api.us-east-1.amazonaws.com/v1/capture-order",
      body
    );
    return { success: { data: response.data }, error: null };
  } catch (e) {
    return handleError(e);
  }
}

export async function update_historical_order(
  email,
  created_at,
  cart
) {
  const body = { email, created_at: created_at + "", cart };

  try {
    const response = await axios.post(
      "https://mxfj3q6m01.execute-api.us-east-1.amazonaws.com/v1/update-historical-order",
      body
    );
    return { success: { data: response.data }, error: null };
  } catch (e) {
    return handleError(e);
  }
}
