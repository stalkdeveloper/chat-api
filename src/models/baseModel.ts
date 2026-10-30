import { Model } from 'sequelize';

export abstract class BaseModel<
  Attributes extends object = object,
  CreationAttributes extends object = Attributes,
> extends Model<Attributes, CreationAttributes> {}
