interface GenerateDailyImageParams {
  dayNumber: number;      // 1 a 365
  passages: string[];     // Passagens do dia
  outputPath?: string;    // Caminho opcional
}
