import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Bid = sequelize.define('Bid', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 100,
    },
  },
  isWinning: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
});

export default Bid;