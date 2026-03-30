import { Link, Navigate, useParams } from 'react-router-dom'
import RevealSection from '../components/RevealSection'
import Card from '../components/Card'
import { blogPosts, getBlogBySlug } from '../data/blogPosts'

function BlogPost() {
    const { slug } = useParams()
    const post = getBlogBySlug(slug)

    if (!post) {
        return <Navigate to="/blog" replace />
    }

    const relatedPosts = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 3)

    return (
        <div className="page page-load">
            <RevealSection className="section blog-article" delay={0.1}>
                <p className="eyebrow">{post.category}</p>
                <h1>{post.title}</h1>
                <div className="blog-article-meta">
                    <span>{post.author}</span>
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                </div>

                <div className="blog-cover card-glass">
                    <p>{post.coverLabel}</p>
                </div>

                <article className="blog-content card-glass">
                    {post.content.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))}
                </article>

                <div className="blog-back-link-wrap">
                    <Link to="/blog" className="read-more">
                        Back to all articles
                    </Link>
                </div>
            </RevealSection>

            <RevealSection className="section" delay={0.16}>
                <div className="section-heading">
                    <p className="eyebrow">Related Reads</p>
                    <h2>More articles you might like</h2>
                </div>
                <div className="blog-grid">
                    {relatedPosts.map((item) => (
                        <Card key={item.slug} className="blog-card card-glass blog-hover">
                            <div className="blog-thumb" aria-hidden="true">
                                {item.thumbnail ? (
                                    <img src={item.thumbnail} alt="" loading="lazy" />
                                ) : (
                                    <span>{item.coverLabel}</span>
                                )}
                            </div>
                            <div className="blog-card-body">
                                <div className="blog-meta">
                                    <span className="category-tag">{item.category}</span>
                                    <span className="read-time">{item.readTime}</span>
                                </div>
                                <h3>{item.title}</h3>
                                <p>{item.excerpt}</p>
                                <div className="blog-footer">
                                    <span className="author">{item.author}</span>
                                    <span className="date">{item.date}</span>
                                </div>
                                <Link to={`/blog/${item.slug}`} className="read-more">
                                    Read article
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            </RevealSection>
        </div>
    )
}

export default BlogPost
