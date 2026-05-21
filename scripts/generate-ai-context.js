var fs = require('fs');
var path = require('path');

// Hexo plugin: generate ai-context.json at build time
hexo.extend.generator.register('ai-context', function(locals) {
  var posts = locals.posts.filter(function(post) {
    return !post.draft;
  }).map(function(post) {
    // Extract first 500 characters of content
    var content = post.content || '';
    // Remove HTML tags
    var plainText = content.replace(/<[^>]+>/g, '');
    // Remove extra whitespace
    plainText = plainText.replace(/\s+/g, ' ').trim();
    // Take first 500 characters
    if (plainText.length > 500) {
      plainText = plainText.substring(0, 500) + '...';
    }

    return {
      title: post.title,
      categories: post.categories ? post.categories.map(function(cat) { return cat.name; }) : [],
      tags: post.tags ? post.tags.map(function(tag) { return tag.name; }) : [],
      summary: plainText,
      url: post.path,
      date: post.date ? post.date.format('YYYY-MM-DD') : ''
    };
  });

  return {
    path: 'ai-context.json',
    data: JSON.stringify(posts, null, 2)
  };
});
