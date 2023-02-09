import { useState, useEffect, useRef } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useNavigate, useParams } from 'react-router-dom'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import {db} from '../firebase.config'
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import Spinner from '../components/Spinner'
import {toast} from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'


function CreateListing() {
  // eslint-disable-next-line
  const [geolocationEnabled, setGeolocationEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [listing, setListing] = useState(false)
  const [formData, setFormData] = useState({
    type: 'rent',
    name: '',
    offer: false,
    regularPrice: '',
    discountedPrice: '',
    address: '',
    wheelSize: '26',
    frameSize: 'XL',
    images: [],
    latitude: 0,
    longitude: 0,
  })
  const {type, 
        name, 
        offer, 
        regularPrice, 
        discountedPrice, 
        address, 
        wheelSize, 
        frameSize,
        images, 
        latitude, 
        longitude,
        } = formData
  const auth = getAuth()
  const navigate = useNavigate()
  const params = useParams()
  const isMounted = useRef(true)
  useEffect(() => {
    if (listing && listing.userRef !== auth.currentUser.uid) {
      toast.error('You can not edit that listing')
      navigate('/')
    }
  })

  // Fetch listing to edit
  useEffect(() => {
    setLoading(true)
    const fetchListing = async () => {
      const docRef = doc(db, 'listings', params.listingId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setListing(docSnap.data())
        setFormData({ ...docSnap.data(), address: docSnap.data().location })
        setLoading(false)
      } else {
        navigate('/')
        toast.error('Listing does not exist')
      }
    }

    fetchListing()
  }, [params.listingId, navigate])

   useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid })
        } else {
          navigate('/sign-in')
        }
      })
    }

    return () => {
      isMounted.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted])

  const onSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    const discPrice = Number(discountedPrice)
    const regPrice = Number(regularPrice)
    if (discPrice > regPrice) {
        toast.error('Discounted Price cannot be higher than Regular Price')
        setLoading(false)
        return
    }

    if (images.length > 6 || images.length < 1) {
        setLoading(false)
        toast.error('Please upload between 1 and 6 images')
        return
    }
    
    let geoLocation = {}
    let location
    // get geolocation
    if (geolocationEnabled) {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`) 
        const data = await response.json()

        geoLocation.lat = data.results[0].geometry.location.lat ?? 0
        geoLocation.lng = data.results[0].geometry.location.lng ?? 0

        location = data.status === 'ZERO_RESULTS' 
                ? undefined 
                : data.results[0].formatted_address
        if (location === undefined || location.includes('undefined')) {
            setLoading(false)
            toast.error('Please enter a valid address')
            return
        }

    } else {
        geoLocation.lat = latitude
        geoLocation.lng = longitude
    }
    // upload images to firebase storage
    const storeImage = async (image) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage()
            const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`
            const storageRef = ref(storage, 'images/' + fileName) 
            const uploadTask = uploadBytesResumable(storageRef, image)
            uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                console.log('Upload is ' + progress + '% done')
            }, 
            (error) => {
                reject(error)
            }, 
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL)
                })
            })
        })
    }

    const imgUrls = await Promise.all(
        [...images].map((image) => storeImage(image))
    ).catch(() => {
        setLoading(false)
        toast.error('Images not uploaded')
        return
    })

    const formDataCopy = {...formData, imgUrls, geoLocation, timestamp: serverTimestamp()}

    formDataCopy.location = address
    delete formDataCopy.images
    delete formDataCopy.address
    !formDataCopy.offer && delete formDataCopy.discountedPrice

    // Update listing
    const docRef = doc(db, 'listings', params.listingId)
    await updateDoc(docRef, formDataCopy)
    setLoading(false)
    toast.success('Listing saved')
    navigate(`/category/${formDataCopy.type}/${docRef.id}`)
  }

  const onMutate = (e) => {
    let boolean = null
    if (e.target.value === 'true') {
        boolean = true
    }
    if (e.target.value === 'false') {
        boolean = false
    }
    //files
    if (e.target.files){
        setFormData ((prevState) => ({
            ...prevState,
            images: e.target.files,
        }))
    }
    if (!e.target.files) {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: boolean ?? e.target.value,
        }))
    } 

  }

  if (loading) {
    return <Spinner />
  }
  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Edit Your Listing</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <label className='formLabel'>Sell / Rent</label>
          <div className='formButtons'>
            <button
              type='button'
              className={type === 'Full-Suspension' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='Full-Suspension'
              onClick={onMutate}
            >
              Full-Suspension
            </button>
            <button
              type='button'
              className={type === 'Hardtail' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='Hardtail'
              onClick={onMutate}
            >
              Hardtail
            </button>
            <button
              type='button'
              className={type === 'Road' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='Road'
              onClick={onMutate}
            >
              Road Bike
            </button>
          </div>
          <label className='formLabel'>Bike Name</label>
          <input
            className='formInputName'
            type='text'
            id='name'
            value={name}
            onChange={onMutate}
            maxLength='35'
            minLength='10'
            required
          />

          <div className='formRooms flex'>
            <div>
              <label className='formLabel'>Wheel Size</label>
              <input
                className='formInputSmall'
                type='number'
                id='wheelSize'
                value={wheelSize}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
            <div>
              <label className='formLabel'>Frame Size</label>
              <input
                className='formInputSmall'
                type='text'
                id='frameSize'
                value={frameSize}
                onChange={onMutate}
                min='1'
                max='2'
                required
              />
            </div>
          </div>
          <label className='formLabel'>Address</label>
          <textarea
            className='formInputAddress'
            type='text'
            id='address'
            value={address}
            onChange={onMutate}
            required
          />

          {!geolocationEnabled && (
            <div className='formLatLng flex'>
              <div>
                <label className='formLabel'>Latitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='latitude'
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className='formLabel'>Longitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='longitude'
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}

          <label className='formLabel'>Offer</label>
          <div className='formButtons'>
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type='button'
              id='offer'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='offer'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Regular Price</label>
          <div className='formPriceDiv'>
            <input
              className='formInputSmall'
              type='number'
              id='regularPrice'
              value={regularPrice}
              onChange={onMutate}
              min='5'
              max='7500'
              required
            />
            {type === 'rent' && <p className='formPriceText'>$ / Day</p>}
          </div>

          {offer && (
            <>
              <label className='formLabel'>Discounted Price</label>
              <input
                className='formInputSmall'
                type='number'
                id='discountedPrice'
                value={discountedPrice}
                onChange={onMutate}
                min='5'
                max='7500'
                required={offer}
              />
            </>
          )}

          <label className='formLabel'>Images</label>
          <p className='imagesInfo'>
            The first image will be the cover (max 6).
          </p>
          <input
            className='formInputFile'
            type='file'
            id='images'
            onChange={onMutate}
            max='6'
            accept='.jpg,.png,.jpeg'
            multiple
            required
          />
          <button type='submit' className='primaryButton createListingButton'>
            Update Listing
          </button>
        </form>
      </main>
    </div>
  )
}
 
export default CreateListing