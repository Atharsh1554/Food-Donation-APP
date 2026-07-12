const fs = require('fs');
const path = require('path');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, DeleteCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const USE_AWS = process.env.USE_AWS === 'true';
const REGION = process.env.AWS_REGION || 'ap-south-1';

let docClient = null;

if (USE_AWS) {
  try {
    const client = new DynamoDBClient({ region: REGION });
    docClient = DynamoDBDocumentClient.from(client);
    console.log('AWS DynamoDB Client Initialized');
  } catch (error) {
    console.error('Failed to initialize AWS DynamoDB Client, falling back to local database:', error);
  }
}

// Local mock database helpers
const LOCAL_DB_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(LOCAL_DB_DIR, 'users.json');
const DONATIONS_FILE = path.join(LOCAL_DB_DIR, 'donations.json');

// Ensure local DB exists
if (!fs.existsSync(LOCAL_DB_DIR)) {
  fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
}
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));
if (!fs.existsSync(DONATIONS_FILE)) fs.writeFileSync(DONATIONS_FILE, JSON.stringify([]));

const readLocalFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const writeLocalFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const db = {
  // USERS TABLE OPERATIONS
  users: {
    async create(user) {
      if (USE_AWS && docClient) {
        const command = new PutCommand({
          TableName: process.env.USERS_TABLE || 'Users',
          Item: user,
        });
        await docClient.send(command);
        return user;
      } else {
        const users = readLocalFile(USERS_FILE);
        users.push(user);
        writeLocalFile(USERS_FILE, users);
        return user;
      }
    },

    async findByEmail(email) {
      if (USE_AWS && docClient) {
        const command = new ScanCommand({
          TableName: process.env.USERS_TABLE || 'Users',
          FilterExpression: 'email = :email',
          ExpressionAttributeValues: { ':email': email },
        });
        const response = await docClient.send(command);
        return response.Items && response.Items.length > 0 ? response.Items[0] : null;
      } else {
        const users = readLocalFile(USERS_FILE);
        return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
      }
    },

    async findById(userId) {
      if (USE_AWS && docClient) {
        const command = new GetCommand({
          TableName: process.env.USERS_TABLE || 'Users',
          Key: { userId },
        });
        const response = await docClient.send(command);
        return response.Item || null;
      } else {
        const users = readLocalFile(USERS_FILE);
        return users.find(u => u.userId === userId) || null;
      }
    }
  },

  // DONATIONS TABLE OPERATIONS
  donations: {
    async create(donation) {
      if (USE_AWS && docClient) {
        const command = new PutCommand({
          TableName: process.env.DONATIONS_TABLE || 'Donations',
          Item: donation,
        });
        await docClient.send(command);
        return donation;
      } else {
        const donations = readLocalFile(DONATIONS_FILE);
        donations.push(donation);
        writeLocalFile(DONATIONS_FILE, donations);
        return donation;
      }
    },

    async findById(donationId) {
      if (USE_AWS && docClient) {
        const command = new GetCommand({
          TableName: process.env.DONATIONS_TABLE || 'Donations',
          Key: { donationId },
        });
        const response = await docClient.send(command);
        return response.Item || null;
      } else {
        const donations = readLocalFile(DONATIONS_FILE);
        return donations.find(d => d.donationId === donationId) || null;
      }
    },

    async list() {
      if (USE_AWS && docClient) {
        const command = new ScanCommand({
          TableName: process.env.DONATIONS_TABLE || 'Donations',
        });
        const response = await docClient.send(command);
        return response.Items || [];
      } else {
        return readLocalFile(DONATIONS_FILE);
      }
    },

    async update(donationId, updates) {
      if (USE_AWS && docClient) {
        // Construct DynamoDB update expression dynamically
        const updateKeys = Object.keys(updates);
        if (updateKeys.length === 0) return this.findById(donationId);

        const UpdateExpression = 'set ' + updateKeys.map(key => `#${key} = :${key}`).join(', ');
        const ExpressionAttributeNames = {};
        const ExpressionAttributeValues = {};

        updateKeys.forEach(key => {
          ExpressionAttributeNames[`#${key}`] = key;
          ExpressionAttributeValues[`:${key}`] = updates[key];
        });

        const command = new UpdateCommand({
          TableName: process.env.DONATIONS_TABLE || 'Donations',
          Key: { donationId },
          UpdateExpression,
          ExpressionAttributeNames,
          ExpressionAttributeValues,
          ReturnValues: 'ALL_NEW',
        });
        const response = await docClient.send(command);
        return response.Attributes;
      } else {
        const donations = readLocalFile(DONATIONS_FILE);
        const index = donations.findIndex(d => d.donationId === donationId);
        if (index !== -1) {
          donations[index] = { ...donations[index], ...updates };
          writeLocalFile(DONATIONS_FILE, donations);
          return donations[index];
        }
        return null;
      }
    },

    async delete(donationId) {
      if (USE_AWS && docClient) {
        const command = new DeleteCommand({
          TableName: process.env.DONATIONS_TABLE || 'Donations',
          Key: { donationId },
        });
        await docClient.send(command);
        return true;
      } else {
        let donations = readLocalFile(DONATIONS_FILE);
        const initialLength = donations.length;
        donations = donations.filter(d => d.donationId !== donationId);
        writeLocalFile(DONATIONS_FILE, donations);
        return donations.length < initialLength;
      }
    }
  }
};

module.exports = db;
