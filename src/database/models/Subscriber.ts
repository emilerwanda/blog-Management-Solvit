import { Sequelize, Model, DataTypes } from "sequelize";

interface SubscriberAttribute {
    id: string;
    email: string;
    name?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface SubscriberCreationAttribute extends Omit<SubscriberAttribute, 'id'> {
    id?: string;
}

export class Subscriber extends Model<SubscriberAttribute, SubscriberCreationAttribute> implements SubscriberAttribute {
    public id!: string;
    public email!: string;
    public name?: string;
    public isActive!: boolean;
    public createdAt!: Date;
    public updatedAt!: Date;

    public toJSON(): object | SubscriberAttribute {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

export const SubscriberModel = (sequelize: Sequelize) => {
    Subscriber.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        timestamps: true,
        modelName: "Subscriber",
        tableName: 'subscribers',
    });
    
    return Subscriber;
};