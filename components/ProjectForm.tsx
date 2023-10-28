'use client'

import { ProjectInterface, SessionInterface } from '@/common.types'
import { ChangeEvent, useState } from 'react'
import Image from 'next/image'
import FormField from './FormField'
import { categoryFilters } from '@/constants'
import CustomMenu from './CustomMenu'
import Button from './Button'
import { createNewProject, fetchToken, updateProject } from '@/lib/actions'
import { useRouter } from 'next/navigation'

type Props = {
  type: string
  session: SessionInterface
  project?: ProjectInterface
}

const ProjectForm = ({type, session, project}:Props) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    image: project?.image || '',
    title: project?.title || '',
    description: project?.description || '',
    liveSiteUrl: project?.liveSiteUrl || '',
    githubUrl: project?.githubUrl || '',
    category: project?.category || '',
  })
  const handleSubmit = async(e:React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const {token} = await fetchToken()
    console.log('handleSubmit token', token)
    try {
      if (type === 'create') {
        const newProject = await createNewProject(form, session?.user?.id, token)
        console.log('handleSubmit newProject', newProject)
        router.push('/')
      }
      if (type === 'edit') {
        const updatedProject =  await updateProject(form, project?.id as string, token)
        console.log('handleSubmit updatedProject', updatedProject)
        router.push('/')
      }
    } catch(error) {
      console.log('handleSubmit error', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleChangeImage = (e:ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const file = e.target.files?.[0]
    console.log('file', file)
    if (!file) return
    if (!file.type.includes('image')) {
      return alert('Please upload an image file')
    }
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      console.log('FileReader onload result', result)
      handleStateChange('image', result)
    }
  }
  const handleStateChange = (fieldName:string, value:string) => {
    setForm(prevState => ({
      ...prevState,
      [fieldName]: value
    }))
  }
  return (
    <form
      onSubmit={handleSubmit}
      className='flexStart form'
    >
      <div className='flexStart form_image-container'>
        <label htmlFor="image" className='flexCenter form_image-label'>
          {!form.image && 'Choose a poster for your project'}
        </label>
        <input
          id="image"
          type="file"
          accept="image/*"
          required={type === 'create'}
          className='form_image-input'
          onChange={handleChangeImage}
        />
        {form.image && (
          <Image
            src={form.image}
            alt="Project poster"
            className='sm:p-10 object-contain z-20'
            fill 
          />
        )}
      </div>
      <FormField
        title="Title"
        state={form.title}
        placeholder="Flexibble"
        setState={(value) => handleStateChange('title', value)}
      />
      <FormField
        title="Description"
        state={form.description}
        placeholder="Showcase and discover remarkable developer projects"
        setState={(value) => handleStateChange('description', value)}
      />
      <FormField
        type="url"
        title="Website URL"
        state={form.liveSiteUrl}
        placeholder="https://flexibble.com"
        setState={(value) => handleStateChange('liveSiteUrl', value)}
      />
      <FormField
        type="url"
        title="GitHub URL"
        state={form.githubUrl}
        placeholder="https://github.com"
        setState={(value) => handleStateChange('githubUrl', value)}
      />
     
      <CustomMenu
        title="Category"
        state={form.category}
        filters={categoryFilters}
        setState={value => handleStateChange('category', value)}
      />
      <div className='flexStart w-full'>
        <Button
          type="submit"
          title={isSubmitting 
            ? (type === 'create' ? 'Creating' : 'Editing') 
            : (type === 'create' ? 'Create' : 'Edit')}
          leftIcon={isSubmitting ? '' : '/plus.svg'}
          isSubmitting={isSubmitting}
        />
      </div>
    </form>
  )
}

export default ProjectForm