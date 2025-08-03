import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const ArticleTitle: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const title = fileData.frontmatter?.title
  if (title) {
    // 处理日期开头的标题
    const dateMatch = title.match(/^\d{4}-\d{2}-\d{2}\s*(.+)$/)
    const displayTitle = dateMatch ? dateMatch[1] : title
    return <h1 class={classNames(displayClass, "article-title")}>{displayTitle}</h1>
  } else {
    return null
  }
}

ArticleTitle.css = `
.article-title {
  margin: 2rem 0 0 0;
}
`

export default (() => ArticleTitle) satisfies QuartzComponentConstructor
