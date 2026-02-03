import { v7 as uuidv7 } from 'uuid';
import { query, closePool } from './client.js';

const users = [
  {
    id: uuidv7(),
    email: 'alice@example.com',
    username: 'alice',
    password_hash: '$2b$10$placeholder_hash_alice',
    display_name: 'Alice Johnson',
    bio: 'Software engineer and tech blogger',
    is_admin: true,
  },
  {
    id: uuidv7(),
    email: 'bob@example.com',
    username: 'bob',
    password_hash: '$2b$10$placeholder_hash_bob',
    display_name: 'Bob Smith',
    bio: 'Full-stack developer',
    is_admin: false,
  },
  {
    id: uuidv7(),
    email: 'carol@example.com',
    username: 'carol',
    password_hash: '$2b$10$placeholder_hash_carol',
    display_name: 'Carol Williams',
    bio: 'DevOps enthusiast',
    is_admin: false,
  },
];

const tags = [
  { id: uuidv7(), name: 'TypeScript', slug: 'typescript', description: 'TypeScript programming language' },
  { id: uuidv7(), name: 'Node.js', slug: 'nodejs', description: 'Node.js runtime' },
  { id: uuidv7(), name: 'PostgreSQL', slug: 'postgresql', description: 'PostgreSQL database' },
  { id: uuidv7(), name: 'DevOps', slug: 'devops', description: 'DevOps practices' },
  { id: uuidv7(), name: 'Testing', slug: 'testing', description: 'Software testing' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function seed() {
  console.log('Seeding database...\n');

  // Insert users
  console.log('Creating users...');
  for (const user of users) {
    await query(
      `INSERT INTO users (id, email, username, password_hash, display_name, bio, is_admin)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO NOTHING`,
      [user.id, user.email, user.username, user.password_hash, user.display_name, user.bio, user.is_admin]
    );
  }
  console.log(`✓ Created ${users.length} users`);

  // Insert tags
  console.log('Creating tags...');
  for (const tag of tags) {
    await query(
      `INSERT INTO tags (id, name, slug, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO NOTHING`,
      [tag.id, tag.name, tag.slug, tag.description]
    );
  }
  console.log(`✓ Created ${tags.length} tags`);

  // Insert posts
  console.log('Creating posts...');
  const posts = [
    {
      id: uuidv7(),
      author_id: users[0].id,
      title: 'Getting Started with TypeScript',
      content: `TypeScript is a powerful typed superset of JavaScript that compiles to plain JavaScript.

## Why TypeScript?

1. **Type Safety**: Catch errors at compile time
2. **Better IDE Support**: Enhanced autocomplete and refactoring
3. **Modern Features**: Access to the latest ECMAScript features

## Getting Started

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}
\`\`\`

TypeScript makes your code more maintainable and less error-prone.`,
      status: 'published',
      published_at: new Date(),
      tag_slugs: ['typescript', 'nodejs'],
    },
    {
      id: uuidv7(),
      author_id: users[0].id,
      title: 'Building REST APIs with Express',
      content: `Express.js is a minimal and flexible Node.js web application framework.

## Setting Up

\`\`\`typescript
import express from 'express';

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3000);
\`\`\`

## Best Practices

- Use proper error handling
- Validate input data
- Implement rate limiting
- Use HTTPS in production`,
      status: 'published',
      published_at: new Date(Date.now() - 86400000),
      tag_slugs: ['typescript', 'nodejs'],
    },
    {
      id: uuidv7(),
      author_id: users[1].id,
      title: 'PostgreSQL Performance Tips',
      content: `PostgreSQL is a powerful open-source relational database. Here are some tips to optimize performance.

## Indexing

Create indexes on frequently queried columns:

\`\`\`sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
\`\`\`

## Query Optimization

Use EXPLAIN ANALYZE to understand query plans:

\`\`\`sql
EXPLAIN ANALYZE SELECT * FROM posts WHERE status = 'published';
\`\`\`

## Connection Pooling

Always use connection pooling in production to avoid connection overhead.`,
      status: 'published',
      published_at: new Date(Date.now() - 172800000),
      tag_slugs: ['postgresql', 'devops'],
    },
    {
      id: uuidv7(),
      author_id: users[2].id,
      title: 'Testing Best Practices',
      content: `Good tests are essential for maintainable software.

## Test Types

1. **Unit Tests**: Test individual functions
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test the full application flow

## Writing Good Tests

\`\`\`typescript
describe('UserService', () => {
  it('should create a user with valid data', async () => {
    const user = await userService.create({
      email: 'test@example.com',
      username: 'testuser',
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});
\`\`\`

## Coverage

Aim for meaningful coverage, not just high percentages.`,
      status: 'published',
      published_at: new Date(Date.now() - 259200000),
      tag_slugs: ['testing', 'typescript'],
    },
    {
      id: uuidv7(),
      author_id: users[1].id,
      title: 'Draft: CI/CD Pipeline Setup',
      content: `This is a work in progress article about setting up CI/CD pipelines.

## Topics to Cover

- GitHub Actions basics
- Docker containerization
- Automated testing
- Deployment strategies`,
      status: 'draft',
      published_at: null,
      tag_slugs: ['devops'],
    },
  ];

  for (const post of posts) {
    const slug = slugify(post.title);
    const excerpt = post.content.slice(0, 200) + '...';

    await query(
      `INSERT INTO posts (id, author_id, title, slug, content, excerpt, status, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (slug) DO NOTHING`,
      [post.id, post.author_id, post.title, slug, post.content, excerpt, post.status, post.published_at]
    );

    // Link tags
    for (const tagSlug of post.tag_slugs) {
      const tag = tags.find(t => t.slug === tagSlug);
      if (tag) {
        await query(
          `INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [post.id, tag.id]
        );
      }
    }
  }
  console.log(`✓ Created ${posts.length} posts`);

  // Insert comments
  console.log('Creating comments...');
  const publishedPosts = posts.filter(p => p.status === 'published');
  let commentCount = 0;

  for (const post of publishedPosts) {
    const commenterId = users[Math.floor(Math.random() * users.length)].id;
    const commentId = uuidv7();

    await query(
      `INSERT INTO comments (id, post_id, author_id, content)
       VALUES ($1, $2, $3, $4)`,
      [commentId, post.id, commenterId, 'Great article! Very informative.']
    );
    commentCount++;

    // Add a reply
    if (Math.random() > 0.5) {
      const replyerId = users.filter(u => u.id !== commenterId)[0].id;
      await query(
        `INSERT INTO comments (id, post_id, author_id, parent_id, content)
         VALUES ($1, $2, $3, $4, $5)`,
        [uuidv7(), post.id, replyerId, commentId, 'Thanks! Glad you found it helpful.']
      );
      commentCount++;
    }
  }
  console.log(`✓ Created ${commentCount} comments`);

  console.log('\nSeeding completed successfully!');
  await closePool();
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
