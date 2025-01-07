import * as whatsappTemplates from "./whatsapp.templates.js";
import env from "dotenv";
env.config();

const whatsAppSender = async (templateName, variables, to) => {
  try {
    const url = `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_ID}/messages`;

    const fun = whatsappTemplates[templateName];
    const template = fun(variables, to);

    if (!template) {
      throw new Error("Invalid template name");
    }


    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(template),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to send message: ${JSON.stringify(errorData.error)}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    throw error;
  }
};

export default whatsAppSender;
