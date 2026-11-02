import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMeAPI, selectCurrentUser, setCurrentUser } from '~/redux/user/userSlice'
import { updatePreferencesAPI } from '~/apis'
import { applyPreferences, startPreferenceSync } from '~/utils/preferencesSync'

// Headless bridge: pulls the SelfUser once per login, applies server preferences to the local
// stores, then debounce-saves any local theme / language / fx change back to the API.
function PreferencesSync() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const userId = currentUser?._id
  const serverPrefsRef = useRef(currentUser?.preferences || {})

  useEffect(() => {
    serverPrefsRef.current = currentUser?.preferences || {}
  }, [currentUser?.preferences])

  useEffect(() => {
    if (!userId) return undefined
    let cancelled = false
    // Apply the cached copy immediately, then refresh from the server
    applyPreferences(serverPrefsRef.current)
    dispatch(fetchMeAPI()).then((action) => {
      if (cancelled || action.error) return
      applyPreferences(action.payload?.preferences || {})
    })

    const stop = startPreferenceSync({
      getServerPreferences: () => serverPrefsRef.current,
      save: (patch) => {
        serverPrefsRef.current = { ...serverPrefsRef.current, ...patch, fx: { ...(serverPrefsRef.current.fx || {}), ...(patch.fx || {}) } }
        updatePreferencesAPI(patch)
          .then((user) => { if (!cancelled && user?._id) dispatch(setCurrentUser(user)) })
          .catch(() => { /* offline: localStorage keeps the change and the next diff retries */ })
      }
    })

    return () => {
      cancelled = true
      stop()
    }
  }, [dispatch, userId])

  return null
}

export default PreferencesSync
