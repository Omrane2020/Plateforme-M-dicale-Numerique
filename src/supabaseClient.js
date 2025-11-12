import { createClient } from '@supabase/supabase-js'

// 🟢 Remplace les valeurs ci-dessous par celles de ton tableau de bord Supabase
const supabaseUrl = 'https://uxytwpqglrqqemvgwdjz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eXR3cHFnbHJxcWVtdmd3ZGp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTAyNjYsImV4cCI6MjA3ODM2NjI2Nn0.TBsg_QZYxoMjwaV3l46vdmW1D7v0h-Gt3rg0KAy72Zw'
export const supabase = createClient(supabaseUrl, supabaseKey)
