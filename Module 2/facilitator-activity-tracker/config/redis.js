const redis = require('redis');
require('dotenv').config();

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null
};

// Create Redis client
const createRedisClient = () => {
  const client = redis.createClient(redisConfig);
  
  client.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  client.on('connect', () => {
    console.log('Connected to Redis');
  });

  client.on('ready', () => {
    console.log('Redis client ready');
  });

  return client;
};

// Create separate clients for different purposes
const redisClient = createRedisClient();
const redisSubscriber = createRedisClient();
const redisPublisher = createRedisClient();

module.exports = {
  redisClient,
  redisSubscriber,
  redisPublisher,
  redisConfig
};