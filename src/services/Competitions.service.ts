import Competitions from "../entities/Competitions.entity";
import { ICreateCompetition } from "../interfaces/competition.interface";
import { competitionRepository } from "../repositories/competition.repository";

export class CompetitionService {
  async create(payload: ICreateCompetition, userId: string): Promise<Competitions> {
    const { name, number_players, description } = payload;

    const newCompetition = competitionRepository.create({
      name,
      number_players,
      description,
      userId,
      players: []
    });

    await competitionRepository.save(newCompetition);
    return newCompetition;
  }

  async getCompetitions() {
    const competitions = await competitionRepository.find({
      where: {
        isActive: true
      }
    });

    return competitions;
  }
}