import { Link } from 'react-router-dom'
import Slider from '../components/Slider'
import roadCategoryImage from '../assets/jpg/roadCategoryImage.jpeg'
import hardtailCategoryImage from '../assets/jpg/hardtailCategoryImage.jpeg'
import fullCategoryImage from '../assets/jpg/fullCategoryImage.jpeg'


function Explore() {
  return (
    <div className='explore'>
      <header>
        <p className='pageHeader'>Explore</p>
      </header>

      <main>
        <Slider />

        <p className='exploreCategoryHeading'>Categories</p>
        <div className='exploreCategories'>
          <Link to='/category/Full-Suspension'>
            <img
              src={fullCategoryImage}
              alt='Full-Suspension'
              className='exploreCategoryImg'
            />
            <p className='exploreCategoryName'>Full-Suspension Bikes</p>
          </Link>
          <Link to='/category/Hardtail'>
            <img
              src={hardtailCategoryImage}
              alt='Hardtail'
              className='exploreCategoryImg'
            />
            <p className='exploreCategoryName'>Hardtail Bikes</p>
          </Link>
          <Link to='/category/Road'>
            <img
              src={roadCategoryImage}
              alt='Road'
              className='exploreCategoryImg'
            />
            <p className='exploreCategoryName'>Road Bikes</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
export default Explore
