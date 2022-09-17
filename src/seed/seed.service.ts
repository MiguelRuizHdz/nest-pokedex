import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios, { AxiosInstance } from 'axios';
import { Model } from 'mongoose';

import { PokeResponse } from './interfaces/poke-response.interface';
import { Pokemon } from '../pokemon/entities/pokemon.entity';


@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance = axios;
  
  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({}); // delete * from pokemons;

    const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');
    
    // const insertPromisesArray = [];
    
    const pokemonToInsert: { name: string, no: number }[] = [];

    data.results.forEach( async ({ name, url }) => {
      
      const segments = url.split('/');
      const no: number = +segments[ segments.length -2 ];

      // const pokemon = await this.pokemonModel.create({ name, no });
      
      // insertPromisesArray.push(
      //   this.pokemonModel.create({ name, no })
      // );

      pokemonToInsert.push({ name, no }); // [{ name: bulbasaur, no: 1 }]

    });

    // await Promise.all( insertPromisesArray );
    
    await this.pokemonModel.insertMany( pokemonToInsert );
    // insert into pokemons (name, no)
    // (name: bulbasaur, no: 1)
    // (name: bulbasaur, no: 1)
    // (name: bulbasaur, no: 1)
    // (name: bulbasaur, no: 1)

    return 'Seed Executed';
  }

}
