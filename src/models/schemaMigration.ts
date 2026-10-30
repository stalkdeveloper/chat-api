import { DataTypes, InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';
import { BaseModel } from './baseModel.ts';

export class SchemaMigration extends BaseModel<
  InferAttributes<SchemaMigration>,
  InferCreationAttributes<SchemaMigration>
> {
  declare name: string;
  declare appliedAt: Date;
}

export function initializeSchemaMigrationModel(sequelize: Sequelize): void {
  SchemaMigration.init(
    {
      name: { type: DataTypes.STRING(191), primaryKey: true, allowNull: false },
      appliedAt: { type: DataTypes.DATE(3), allowNull: false, field: 'applied_at' },
    },
    {
      sequelize,
      tableName: 'schema_migrations',
      timestamps: false,
      underscored: true,
    },
  );
}
