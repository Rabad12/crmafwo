import { Routes, Route } from 'react-router-dom'
import AdminLayout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Clients from './pages/Clients'
import ProfilPelanggan from './pages/ProfilPelanggan'
import EditPelanggan from './pages/EditPelanggan'
import Workers from './pages/Workers'
import EditWorker from './pages/EditWorker'
import PendapatanKaryawan from './pages/PendapatanKaryawan'
import Services from './pages/Services'
import EditLayanan from './pages/EditLayanan'
import Produk from './pages/Produk'
import EditProduk from './pages/EditProduk'
import Riwayat from './pages/Riwayat'
import AddTransaction from './pages/AddTransaction'
import Appointment from './pages/Appointment'
import AddAppointment from './pages/AddAppointment'
import Absensi from './pages/Absensi'
import Laporan from './pages/Laporan'
import PelangganAktif from './pages/PelangganAktif'
import RekapKomisi from './pages/RekapKomisi'
import Profil from './pages/Profil'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pelanggan" element={<Clients />} />
        <Route path="/pelanggan/:id" element={<ProfilPelanggan />} />
        <Route path="/pelanggan/:id/edit" element={<EditPelanggan />} />
        <Route path="/karyawan/pendapatan" element={<PendapatanKaryawan />} />
        <Route path="/karyawan" element={<Workers />} />
        <Route path="/karyawan/:id/edit" element={<EditWorker />} />
        <Route path="/layanan" element={<Services />} />
        <Route path="/layanan/:id/edit" element={<EditLayanan />} />
        <Route path="/produk" element={<Produk />} />
        <Route path="/produk/:id/edit" element={<EditProduk />} />
        <Route path="/riwayat" element={<Riwayat />} />
        <Route path="/transaksi/baru" element={<AddTransaction />} />
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/appointment/baru" element={<AddAppointment />} />
        <Route path="/absensi" element={<Absensi />} />
        <Route path="/laporan" element={<Laporan />} />
        <Route path="/pelanggan-aktif" element={<PelangganAktif />} />
        <Route path="/rekap-komisi" element={<RekapKomisi />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}