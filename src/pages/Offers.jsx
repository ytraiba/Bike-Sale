import { useEffect, useState } from "react"
// import { useParams } from "react-router-dom"
import { getDocs, collection, query, where, orderBy, limit} from "firebase/firestore"
// , startAfter 
import { db } from "../firebase.config"
import Spinner from "../components/Spinner"
import { toast } from "react-toastify"
import ListingItem from "../components/ListingItem"

function Offers() {
    const [listings, setListings] = useState([])
    const [loading, setLoading] = useState(true)

    // const params = useParams()
    
    useEffect(() => {
      const fetchListings = async () => {
        try {
          // Get reference
          const listingsRef = collection(db, 'listings')
          // Create a query
          const q = query(
            listingsRef,
            where('offer', '==', true  ),
            orderBy('timestamp', 'desc'),
            limit(10)
          )
          // Execute query
          const querySnap = await getDocs(q)
          const listings = []
          querySnap.forEach((doc) => {
            return listings.push({
              id: doc.id,
              data: doc.data(),
            })
          })
  
          setListings(listings)
          setLoading(false)
        } catch (error) {
          toast.error('Could not fetch listings')
        }
      }
  
      fetchListings()
    }, [])
  

    return (
      <div className='category'>
      <header>
        <p className='pageHeader'>
          Special  Offers
        </p>
      </header>

      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className='categoryListings'>
              {listings.map((listing) => (
                <ListingItem
                  listing={listing.data}
                  id={listing.id}
                  key={listing.id}
                />
              ))}
            </ul>
          </main>

          <br />
          <br />
          {/* {lastFetchedListing && (
            <p className='loadMore' onClick={onFetchMoreListings}>
              Load More
            </p>
          )} */}
        </>
      ) : (
        <p>No Special Offers</p>
      )}
    </div>
    )
}

export default Offers
