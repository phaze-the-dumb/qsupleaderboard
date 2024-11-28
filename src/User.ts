export class User{
  _id!: string;
  avatar!: string;
  username!: string;
  messageCreateCount!: number;
  messageDeleteCount!: number;
  messageEditCount!: number;
  typedCharacterCount!: number;
  words!: Word[];
}

export class Word{
  word!: string;
  uses!: number;
}