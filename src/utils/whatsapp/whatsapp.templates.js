const ctaUrl = (params,to) => {
  return JSON.stringify({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "cta_url",
      header: {
        type: "text",
        text: params[0],
      },
      body: {
        text: params[1],
      },
      footer: {
        text: params[2],
      },
      action: {
        name: "cta_url",
        parameters: {
          display_text: "LitePay website",
          url: "https://www.litepay-eg.net/en",
        },
      },
    },
  });
};

const otpTemplate = (params, to) => ({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": to,
    "type": "template",
    "template": {
      "name": "otp",
      "language": {
        "code": "en_US"
      },
      "components": [
        {
          "type": "body",
          "parameters": [
            {
              "type": "text",
              "text": params[0]
            }
          ]
        },
        {
          "type": "button",
          "sub_type": "url",
          "index": "0",
          "parameters": [
            {
              "type": "text",
              "text": params[1]
            }
          ]
        }
      ]
    }
});



const paymentDecline = (params, to) => {
  return JSON.stringify({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "cta_url",
      body: {
        text:`Payment Declined. Amount: ${params[0]} USD. Date: ${(new Date()).toLocaleString()}. Please visit the link below.`
      },
      action: {
        name: "cta_url",
        parameters: {
          display_text: params[1] || "Go to LitePay",
          url: params[2] || "https://www.litepay-eg.net/en"
        }
      }
    }
  });
};




export { ctaUrl,otpTemplate,paymentDecline }
