import { Link } from 'react-router-dom'
import Card from '../components/Card'
import RevealSection from '../components/RevealSection'
import { blogPosts } from '../data/blogPosts'

function Blog() {
    return (
        <div className="page page-load">
            <RevealSection className="section page-top-hero hero-theme-blog" delay={0.1}>
                <div className="section-heading text-center">
                    <p className="eyebrow">Insights & Updates</p>
                    <h1>Stay informed on money, savings, and everyday banking</h1>
                </div>
            </RevealSection>

            <RevealSection className="section" delay={0.15}>
                <div className="blog-grid">
                    {blogPosts.map((post) => (
                        <Card key={post.id} className="blog-card card-glass blog-hover">
                            <div className="blog-thumb" aria-hidden="true">
                                {post.thumbnail ? (
                                    <img src={post.thumbnail} alt="" loading="lazy" />
                                ) : (
                                    <span>{post.coverLabel}</span>
                                )}
                            </div>
                            <div className="blog-card-body">
                                <div className="blog-meta">
                                    <span className="category-tag">{post.category}</span>
                                    <span className="read-time">{post.readTime}</span>
                                </div>
                                <h3>
                                    <Link to={`/blog/${post.slug}`} className="blog-title-link">
                                        {post.title}
                                    </Link>
                                </h3>
                                <p>{post.excerpt}</p>
                                <div className="blog-footer">
                                    <span className="author">{post.author}</span>
                                    <span className="date">{post.date}</span>
                                </div>
                                <Link to={`/blog/${post.slug}`} className="read-more">
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

export default Blog
