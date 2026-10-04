import './register-ts-resolver.mjs'
import { curriculumLessonDirectory } from '../src/curriculum/generated/lessonDirectory.ts'
import { curriculumTracks } from '../src/curriculum/tracks.ts'
import { curriculumLibraryDomains } from '../src/curriculum/library.ts'
import { courseCatalog } from '../src/curriculum/courses/catalog.ts'
import { legacyAiOverviewLessons } from '../src/curriculum/routes.ts'
import { legacyPythonDataToolsChapterMap } from '../src/utils/pythonDataToolsRoutes.ts'

export function pagesEntrypoints() {
  const routes = new Set(['/', '/data-lab', '/math-lab', '/math-lab/diagnostic', '/progress', '/projects', '/python', '/spine', '/math-lab/modules/beginner-calculus'])
  for (const module of curriculumLessonDirectory) {
    routes.add(module.route)
    routes.add(`/learn/${module.id}`)
    for (const lesson of module.lessons) {
      routes.add(`/learn/${module.id}/${lesson.id}`)
      if (module.source === 'algorithm') routes.add(`${module.route}/${lesson.id}`)
      if (module.id === 'python-notebook') routes.add(`/python/${lesson.id}`)
    }
  }
  for (const lessonId of Object.keys(legacyAiOverviewLessons)) routes.add(`/learn/ai-overview/${lessonId}`)
  for (const lessonId of Object.keys(legacyPythonDataToolsChapterMap)) {
    routes.add(`/python/${lessonId}`)
    routes.add(`/learn/python-notebook/${lessonId}`)
  }
  for (const moduleId of ['mlp', 'cnn-visualization']) routes.add(`/learn/${moduleId}/explore`)
  for (const track of curriculumTracks) routes.add(`/tracks/${track.id}`)
  for (const domain of curriculumLibraryDomains) routes.add(`/library/${domain.id}`)
  for (const course of courseCatalog) {
    routes.add(`/courses/${course.id}`)
    // Planned unit URLs have their own entry so the compatibility redirect can execute.
    for (const unit of course.units) routes.add(`/courses/${course.id}/units/${unit.id}`)
  }
  return [...routes].sort()
}
