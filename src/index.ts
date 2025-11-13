import qrcode from "qrcode-terminal";
import { Client, LocalAuth, Chat } from "whatsapp-web.js";
import cron from "node-cron";
import { botConfig } from "./config/bot.config";

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("📱 Escaneie o QR code acima para conectar ao WhatsApp.");
});

client.on("ready", async () => {
  console.log("✅ WhatsApp conectado com sucesso!");

  const sendMessage = async () => {
    try {
      const chats: Chat[] = await client.getChats();
      const group = chats.find(
        (chat) =>
          chat.isGroup &&
          chat.name.toLowerCase() === botConfig.groupName.toLowerCase()
      );

      if (!group) {
        console.error(`❌ Grupo '${botConfig.groupName}' não encontrado!`);
        return;
      }

      const message =
        botConfig.automation && botConfig.automation.message
          ? botConfig.automation.message
          : "Mensagem padrão: Olá, grupo!";

      await client.sendMessage(group.id._serialized, message);
      console.log(`📤 Mensagem enviada para '${group.name}'`);
    } catch (err) {
      console.error("❌ Erro ao enviar mensagem:", err);
    }
  };

  if (botConfig.automation && botConfig.automation.enabled) {
    console.log(
      `⏰ Automação ativada — enviará mensagem às ${botConfig.automation.schedule}`
    );
    cron.schedule(botConfig.automation.schedule!, sendMessage);
  } else {
    console.log("⚙️ Automação desativada — enviando mensagem agora...");
    await sendMessage();
  }
});

client.initialize();
