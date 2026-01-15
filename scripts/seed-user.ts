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

function printUsers(users: User[]) {
  console.log("\n📋 Usuários cadastrados:");
  users.forEach((u, i) => {
    console.log(
      `${i + 1}) [ID ${u.id}] ${u.groupName} | ${u.plan} | ${u.version} | ${
        u.scheduleTime
      }`
    );
  });
}

async function selectUser(users: User[]): Promise<User | null> {
  printUsers(users);
  const answer = await ask(
    "\nDigite o número do usuário para editar (ou ENTER para cancelar): "
  );

  if (!answer) return null;

  const index = Number(answer) - 1;
  if (isNaN(index) || !users[index]) {
    console.log("❌ Seleção inválida.");
    return null;
  }

  return users[index];
}

async function createUser(repo: any) {
  console.log("\n➕ CRIANDO NOVO USUÁRIO\n");

  const groupName = await ask("Nome do grupo: ");
  const welcomeText = await ask("Texto de boas-vindas: ");

  console.log("\nPlanos disponíveis:");
  Object.values(PlanEnum).forEach((p) => console.log(" -", p));
  const plan = (await ask("Escolha o plano: ")) as PlanEnum;

  console.log("\nVersões disponíveis:");
  Object.values(VersionEnum).forEach((v) => console.log(" -", v));
  const version = (await ask("Escolha a versão: ")) as VersionEnum;

  const startDate =
    (await ask("Data de início (YYYY-MM-DD) [HOJE]: ")) ||
    new Date().toISOString().split("T")[0];

  const scheduleTime = (await ask("Horário (HH:mm) [06:00]: ")) || "06:00";

  const user = repo.create({
    groupName,
    welcomeText,
    plan,
    version,
    startDate,
    scheduleTime,
  });

  await repo.save(user);
  console.log("✅ Usuário criado com sucesso!\n");
}

async function editUser(repo: any, user: User) {
  console.log(`\n✏️ EDITANDO USUÁRIO: ${user.groupName}\n`);
  console.log("Pressione ENTER para manter o valor atual.\n");

  const groupName =
    (await ask(`Nome do grupo [${user.groupName}]: `)) || user.groupName;

  const welcomeText =
    (await ask("Texto de boas-vindas [atual]: ")) || user.welcomeText;

  console.log("\nPlanos disponíveis:");
  Object.values(PlanEnum).forEach((p) => console.log(" -", p));
  const plan = ((await ask(`Plano [${user.plan}]: `)) as PlanEnum) || user.plan;

  console.log("\nVersões disponíveis:");
  Object.values(VersionEnum).forEach((v) => console.log(" -", v));
  const version =
    ((await ask(`Versão [${user.version}]: `)) as VersionEnum) || user.version;

  const startDate =
    (await ask(`Data início [${user.startDate}]: `)) || user.startDate;

  const scheduleTime =
    (await ask(`Horário [${user.scheduleTime}]: `)) || user.scheduleTime;

  Object.assign(user, {
    groupName,
    welcomeText,
    plan,
    version,
    startDate,
    scheduleTime,
  });

  await repo.save(user);
  console.log("✅ Usuário atualizado com sucesso!\n");
}

async function main() {
  console.log("\n📘 Gerenciador de Usuários — Devotional Bot\n");

  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(User);

  let running = true;

  while (running) {
    const users = await repo.find();

    console.log("\n================ MENU ================");
    console.log("1) Listar usuários");
    console.log("2) Criar novo usuário");
    console.log("3) Editar usuário existente");
    console.log("4) Sair");
    console.log("=====================================");

    const option = await ask("Escolha uma opção: ");

    switch (option) {
      case "1":
        users.length ? printUsers(users) : console.log("Nenhum usuário.");
        break;

      case "2":
        await createUser(repo);
        break;

      case "3":
        if (!users.length) {
          console.log("❌ Nenhum usuário para editar.");
          break;
        }
        const selected = await selectUser(users);
        if (selected) await editUser(repo, selected);
        break;

      case "4":
        running = false;
        break;

      default:
        console.log("❌ Opção inválida.");
    }
  }

  console.log("\n👋 Encerrando...");
  rl.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  rl.close();
  process.exit(1);
});
