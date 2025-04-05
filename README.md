<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Backend - Todo List Application (NestJS et Prisma)

## Configuration et démarrage du backend

Après avoir mis à jour les informations dans le fichier `.env` et créé la base de données, on exécute ces commandes dans un nouveau terminal :

```bash
cd backend
yarn install
yarn prisma:generate
yarn prisma:migrate:run
yarn start:dev
TaskController
```
### TaskController

J'ai terminé l'implémentation du TaskController, qui fournit les endpoints suivants pour gérer les tâches :

- GET /tasks : Récupère toutes les tâches.

- POST /tasks : Crée une nouvelle tâche. Vous devez fournir un objet SaveTaskDto avec les données de la tâche.

- PATCH /tasks/:id : Met à jour une tâche existante. Vous devez fournir l'ID de la tâche en paramètre et les données de mise à jour dans le corps de la requête.

- DELETE /tasks/:id : Supprime une tâche en fonction de l'ID fourni.

Voici l'implémentation complète du TaskController :

```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import SaveTaskUseCase from '../UseCase/SaveTask/SaveTaskUseCase';
import DeleteTask from '../UseCase/DeleteTask/DeleteTask';
import GetAllTasksUseCase from '../UseCase/GetAllTasks/GetAllTasksUseCase';
import SaveTaskDto from '../UseCase/SaveTask/SaveTaskDto';
import UseCaseFactory from '../UseCase/UseCaseFactory';

@Controller()
export default class TaskController {
  constructor(private readonly useCaseFactory: UseCaseFactory) {}

  @Get('/tasks')
  async getAll() {
    return (await this.useCaseFactory.create(GetAllTasksUseCase)).handle();
  }

  @Post('/tasks')
  async create(@Body() dto: SaveTaskDto) {
    return (await this.useCaseFactory.create(SaveTaskUseCase)).handle(dto);
  }

  @Patch('/tasks/:id')
  async update(@Param('id') id: string, @Body() dto: SaveTaskDto) {
    dto.id = Number(id); // Assigner l'ID de la tâche à mettre à jour
    return (await this.useCaseFactory.create(SaveTaskUseCase)).handle(dto);
  }

  @Delete('/tasks/:id')
  async delete(@Param('id') id: string) {
    return (await this.useCaseFactory.create(DeleteTask)).handle(Number(id));
  }
}
```

### SaveTaskUseCase

J'ai implémenté le SaveTaskUseCase, qui gère la création et la mise à jour des tâches. Ce cas d'utilisation garantit que :

- Le nom de la tâche est bien fourni et est une chaîne de caractères.

- Si un ID de tâche est fourni, il met à jour la tâche correspondante.

- Si aucun ID n'est fourni, il crée une nouvelle tâche.

Voici l'implémentation complète du SaveTaskUseCase :

```typescript
import { Injectable } from '@nestjs/common';
import { Task } from '@prisma/client';
import { UseCase } from '../../index';
import SaveTaskDto from './SaveTaskDto';
import { PrismaService } from '../../PrismaService';

@Injectable()
export default class SaveTaskUseCase implements UseCase<Promise<Task>, [dto: SaveTaskDto]> {
  constructor(private readonly prisma: PrismaService) {}

  async handle(dto: SaveTaskDto): Promise<Task> {
    if (!dto.name || typeof dto.name !== 'string') {
      throw new Error('Le nom de la tâche est requis et doit être une chaîne de caractères');
    }

    try {
      let task: Task;

      if (dto.id !== null) {
        task = await this.prisma.task.update({
          where: { id: dto.id },
          data: { name: dto.name },
        });
      } else {
        task = await this.prisma.task.create({
          data: { name: dto.name },
        });
      }

      return task;
    } catch (error) {
      throw new Error(`Erreur lors de l'enregistrement de la tâche : ${error.message}`);
    }
  }
}
```

## Résumé
- Le TaskController inclut des endpoints pour la gestion des tâches (création, mise à jour, suppression, récupération).
- Le SaveTaskUseCase est utilisé pour créer et mettre à jour les tâches, avec une validation correcte des données et la gestion des opérations sur la base de données avec Prisma.


