export interface AutomationConfig {
  enabled: boolean;
  schedule?: string; // formato cron ex: "0 6 * * *"
  message?: string;
}

export interface BotConfig {
  groupName: string;
  automation: AutomationConfig | false;
}

export const botConfig: BotConfig = {
  // Nome do grupo onde as mensagens serão enviadas
  groupName: "Teste",

  // Configuração de automação
  automation: {
    enabled: true,             // se false, envia só ao rodar o script
    schedule: "0 5 * * *",     // horário (5h da manhã)
    message: "Bom dia, grupo Teste! ☀️ Mensagem automática das 6h.",
  },
};
