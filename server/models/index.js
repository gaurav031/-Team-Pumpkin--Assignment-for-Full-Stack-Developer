import User from './User.js';
import Item from './Item.js';
import Bid from './Bid.js';

// Define associations
User.hasMany(Bid);
Bid.belongsTo(User);

Item.hasMany(Bid);
Bid.belongsTo(Item);

User.hasMany(Item);
Item.belongsTo(User);

export { User, Item, Bid };