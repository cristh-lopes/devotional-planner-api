import "reflect-metadata";
import readline from "readline";
import { AppDataSource } from "../src/database/data-source";
import { User } from "../src/database/entities/User";
import { PlanEnum } from "../src/modules/plan/plan.enum";
import { VersionEnum } from "../src/modules/bible/bible.enum";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function main() {
  console.log("\n📘 Iniciando configuração inicial do usuário...\n");

  await AppDataSource.initialize();
  console.log("💾 Conectado ao banco.\n");

  const groupName = await ask("Nome do grupo: ");
  const welcomeText = await ask("Texto de boas-vindas: ");

  console.log("\nPlanos disponíveis:");
  Object.values(PlanEnum).forEach((p) => console.log(" -", p));
  const planAnswer = await ask("Escolha o plano: ");
  const plan = planAnswer as PlanEnum;

  console.log("\nVersões disponíveis:");
  Object.values(VersionEnum).forEach((v) => console.log(" -", v));
  const versionAnswer = await ask("Escolha a versão (ex: nvi): ");
  const version = versionAnswer as VersionEnum;

  const startDate =
    (await ask("Data de início (YYYY-MM-DD) [default HOJE]: ")) ||
    new Date().toISOString().split("T")[0];

  const scheduleTime =
    (await ask("Horário (HH:mm) [default 06:00]: ")) || "06:00";

  const repo = AppDataSource.getRepository(User);

  const user = repo.create({
    groupName,
    welcomeText,
    plan,
    version,
    startDate,
    scheduleTime,
  });

  await repo.save(user);

  console.log("\n✅ Usuário criado com sucesso!");
  console.log("=======================================");
  console.log("ID..............:", user.id);
  console.log("Grupo...........:", groupName);
  console.log("Boas-vindas.....:", welcomeText);
  console.log("Plano...........:", plan);
  console.log("Versão..........:", version);
  console.log("Início..........:", startDate);
  console.log("Horário.........:", scheduleTime);
  console.log("=======================================\n");

  rl.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  rl.close();
});
