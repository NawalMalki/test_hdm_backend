import { Injectable } from '@nestjs/common';
import { Task } from '@prisma/client';
import { UseCase } from '../../index';
import SaveTaskDto from './SaveTaskDto';
import { PrismaService } from '../../PrismaService'; 

@Injectable()
export default class SaveTaskUseCase implements UseCase<Promise<Task>, [dto: SaveTaskDto]> {
  constructor(private readonly prisma: PrismaService) {}

  async handle(dto: SaveTaskDto): Promise<Task> {
    // Validation des données entrantes (DTO)
    if (!dto.name || typeof dto.name !== 'string') {
      throw new Error('Le nom de la tâche est requis et doit être une chaîne de caractères');
    }

    // Si un ID est fourni, mettre à jour la tâche existante ; sinon, créer une nouvelle tâche
    try {
      let task: Task;
      
      if (dto.id !== null) {
        // Mise à jour d'une tâche existante
        task = await this.prisma.task.update({
          where: { id: dto.id },
          data: { name: dto.name },
        });
      } else {
        // Création d'une nouvelle tâche
        task = await this.prisma.task.create({
          data: { name: dto.name },
        });
      }

      return task;
    } catch (error) {
      // Gestion des erreurs : on attrape et relance l'erreur avec un message
      throw new Error(`Erreur lors de l'enregistrement de la tâche : ${error.message}`);
    }
  }
}
