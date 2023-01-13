import { bracketRepository } from "../repositories/bracket.repository";
import { competitionRepository } from "../repositories/competition.repository";
import { playerRepository } from "../repositories/player.repository";

export class BracketsStartedService {
  async create(idCompetition: string) {
    const competition = await competitionRepository.findOne({
      where: {
        id: idCompetition
      },
      relations: {
        players: true,
        bracket: true
      }
    });

    if (!competition?.bracket.length) {
      const players = competition?.players;

      const playerSort = players?.sort(() => Math.random() - 0.5);

      if (playerSort) {
        for (let i = 0; i < playerSort.length; i += 2) {
          const bracket = bracketRepository.create({
            competition: { id: idCompetition },
            player1: { ...playerSort[i] },
            player2: { ...playerSort[i + 1] },
            currentRound: playerSort.length / 2
          });
          await bracketRepository.save(bracket);
        }
      }
    }

    const competitionBracket = await competitionRepository.findOne({
      where: {
        id: idCompetition
      },
      relations: {
        players: true,
        bracket: {
          player1: true,
          player2: true,
          winner: true,
          loser: true
        }
      }
    });

    return competitionBracket;
  }

  async winnerPlayer(idBrackets: string, winner: string) {
    const bracket = await bracketRepository.findOne({
      where: {
        id: idBrackets
      },
      relations: {
        player1: true,
        player2: true,
        winner: true,
        loser: true,
        competition: true
      }
    });

    if (winner && bracket) {
      const playerWinner = await playerRepository.findOneBy({
        id: winner
      });
      if (playerWinner) {
        bracket.winner = playerWinner;
      }

      if (winner === bracket.player1.id) {
        const playerLoser = await playerRepository.findOneBy({
          id: bracket.player2.id
        });
        if (playerLoser) {
          bracket.loser = playerLoser;
        }
      } else {
        const playerLoser = await playerRepository.findOneBy({
          id: bracket.player1.id
        });
        if (playerLoser) {
          bracket.loser = playerLoser;
        }
      }
      await bracketRepository.save(bracket);
    }
    if (bracket) {
      this.createNew(bracket?.competition.id);
    }
    return bracket;
  }

  async createNew(idCompetition: string) {
    const competitionBracket = await competitionRepository.findOne({
      where: {
        id: idCompetition
      },
      relations: {
        players: true,
        bracket: {
          player1: true,
          player2: true,
          winner: true,
          loser: true
        }
      }
    });

    let finishBracket = true;
    const playersWinner: any[] = [];
    let currentRound = 10;

    // eslint-disable-next-line array-callback-return
    competitionBracket?.bracket.map((bracket) => {
      if (currentRound > bracket.currentRound) {
        currentRound = bracket.currentRound;
      }
    });

    // eslint-disable-next-line array-callback-return
    competitionBracket?.bracket.map((bracket) => {
      if (!bracket.winner) {
        finishBracket = false;
      }
      if (currentRound === bracket.currentRound) {
        playersWinner.push(bracket.winner);
      }
    });

    if (finishBracket) {
      if (playersWinner.length >= 2) {
        for (let i = 0; i < playersWinner.length; i += 2) {
          const bracket = bracketRepository.create({
            competition: { id: idCompetition },
            player1: { ...playersWinner[i] },
            player2: { ...playersWinner[i + 1] },
            currentRound: playersWinner.length / 2
          });

          await bracketRepository.save(bracket);
        }
      }
    }

    const competition = await competitionRepository.findOne({
      where: {
        id: idCompetition
      },
      relations: {
        players: true,
        bracket: {
          player1: true,
          player2: true,
          winner: true,
          loser: true
        }
      }
    });

    return competition;
  }
}