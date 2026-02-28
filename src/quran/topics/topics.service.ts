import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TopicIndex } from '../entities/topic_index.entity';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(TopicIndex)
    private topicRepository: Repository<TopicIndex>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.topicRepository.findAndCount({
      order: { topicNameUrdu: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }

  async searchTopics(query: string) {
    if (!query || query.trim().length < 2) {
      return {
        query,
        results: [],
        count: 0,
        message: 'Query must be at least 2 characters',
      };
    }

    // Sanitize input to prevent SQL injection
    const sanitizedQuery = query.replace(/[%_]/g, '\\$&');

    const topics = await this.topicRepository
      .createQueryBuilder('topic')
      .where('topic.topicNameUrdu ILIKE :query', { query: `%${sanitizedQuery}%` })
      .orWhere('topic.topicNameEnglish ILIKE :query', { query: `%${sanitizedQuery}%` })
      .orWhere('topic.category ILIKE :query', { query: `%${sanitizedQuery}%` })
      .orderBy('topic.topicNameUrdu', 'ASC')
      .getMany();

    return {
      query,
      results: topics,
      count: topics.length,
    };
  }

  async getTopicsByCategory(category: string, page = 1, limit = 20) {
    if (!category) {
      return await this.findAll(page, limit);
    }

    const [data, total] = await this.topicRepository.findAndCount({
      where: { category },
      order: { topicNameUrdu: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }

  async getTopicById(id: number) {
    const cacheKey = `topic:${id}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const topic = await this.topicRepository.findOne({
      where: { id },
    });

    if (topic) await this.cacheManager.set(cacheKey, topic);
    return topic;
  }

  async createTopic(topicData: Partial<TopicIndex>) {
    const topic = this.topicRepository.create(topicData);
    return await this.topicRepository.save(topic);
  }

  async updateTopic(id: number, topicData: Partial<TopicIndex>) {
    await this.topicRepository.update(id, topicData);
    return await this.getTopicById(id);
  }

  async deleteTopic(id: number) {
    await this.cacheManager.del(`topic:${id}`);
    await this.topicRepository.delete(id);
    return { message: 'Topic deleted successfully' };
  }
}