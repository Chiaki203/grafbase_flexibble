import { fetchAllProjects, fetchFilteredProjects } from '@/lib/actions'
import { ProjectInterface } from '@/common.types'
import ProjectCard from '@/components/ProjectCard'
import Categories from '@/components/Categories'
import LoadMore from '@/components/LoadMore'

type ProjectSearch = {
  projectSearch: {
    edges: {
      node: ProjectInterface
    }[]
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
      startCursor: string
      endCursor: string
    }
  }
}

type Props = {
  searchParams: {
    category?: string 
    endcursor?: string
  }
}

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0


const Home = async({searchParams: {category, endcursor}}: Props) => {
  console.log('home endCursor', endcursor)
  const data = (category === undefined 
    ? await fetchAllProjects(endcursor) as ProjectSearch 
    : await fetchFilteredProjects(category, endcursor) as ProjectSearch)
  const projectsToDisplay = data?.projectSearch?.edges || []
  const pagination = data.projectSearch.pageInfo
  if (projectsToDisplay.length === 0) {
    return (
      <section className='flexStart flex-col paddings'>
        <Categories/>
        <p className='no-result-text text-center'>
          No projects found, go create some first.
        </p>
      </section>
    )
  }
  return (
    <section className='flexStart flex-col paddings mb-16'>
      <Categories/>
      <section className='projects-grid'>
        {projectsToDisplay.map(({node}:{node:ProjectInterface}) => (
          <ProjectCard
            key={node.id}
            id={node.id}
            image={node.image}
            title={node.title}
            name={node.createdBy.name}
            avatarUrl={node.createdBy.avatarUrl}
            userId={node.createdBy.id}
          />
        ))}
      </section>
      <LoadMore
        startCursor={pagination.startCursor}
        endCursor={pagination.endCursor}
        hasPreviousPage={pagination.hasPreviousPage}
        hasNextPage={pagination.hasNextPage}
      />
    </section>
  )
}

export default Home