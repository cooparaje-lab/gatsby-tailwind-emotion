/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it
const _ = require("lodash")
const path = require(`path`)
const { paginate } = require("gatsby-awesome-pagination")

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  return new Promise((resolve, reject) => {
    const blogSingle = path.resolve(`./src/templates/BlogSingle.js`)
    const tagTemplate = path.resolve(`src/templates/TagsArchive.js`)
    const catTemplate = path.resolve(`src/templates/CategoriesArchive.js`)

    resolve(
      graphql(
        `
          {
            allContentfulBlog {
              edges {
                node {
                  title
                  slug
                  tags
                  category
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          console.log(result.errors)
          reject(result.errors)
        }

        paginate({
          createPage,
          items: result.data.allContentfulBlog.edges,
          itemsPerPage: 12,
          pathPrefix: "/blog",
          component: path.resolve("src/templates/BlogArchive.js"),
        })

        const posts = result.data.allContentfulBlog.edges

        posts.forEach((post, index) => {
          createPage({
            path: `/blog/${post.node.slug}/`,
            component: blogSingle,
            context: {
              slug: post.node.slug,
              prev: index === 0 ? null : posts[index - 1].node,
              next: index === posts.length - 1 ? null : posts[index + 1].node,
            },
          })
        })

        // create Tags pages
        // pulled directly from https://www.gatsbyjs.org/docs/adding-tags-and-categories-to-blog-posts/#add-tags-to-your-markdown-files
        let tags = []
        // Iterate through each post, putting all found tags into `tags`
        _.each(posts, edge => {
          if (_.get(edge, "node.tags")) {
            tags = tags.concat(edge.node.tags)
          }
        })
        // Eliminate duplicate tags
        tags = _.uniq(tags)
        // Make tag pages
        tags.forEach(tag => {
          createPage({
            path: `/etiquetas/${_.kebabCase(tag)}/`,
            component: tagTemplate,
            context: {
              tag,
            },
          })
        })

        let categories = []
        _.each(posts, edge => {
          if (_.get(edge, "node.category")) {
            categories = categories.concat(edge.node.category)
          }
        })
        categories = _.uniq(categories)
        categories.forEach(category => {
          createPage({
            path: `/categoria/${_.kebabCase(category)}/`,
            component: catTemplate,
            context: {
              category,
            },
          })
        })
      })
    )
  })
}
