import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

interface TokenAttributes {
  id: string;
  jti: string;
  token: string;
  userId: string;
  blacklisted: boolean;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional `id` for creation
type TokenCreationAttributes = Optional<TokenAttributes, 'id' | 'blacklisted'>;

export class Token extends Model<TokenAttributes, TokenCreationAttributes> implements TokenAttributes {
  declare id: string;
  declare jti: string;
  declare token: string;
  declare userId: string;
  declare blacklisted: boolean;
  declare expiresAt: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Token.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    jti: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    blacklisted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Token',
    tableName: 'tokens',
    timestamps: true, // enables createdAt and updatedAt
    underscored: false, // change to true if you prefer snake_case columns
  }
);
