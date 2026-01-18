import Image from "next/image";
import Link from "next/link";
export default function Footer(){
return  <footer className="w-full flex flex-col border-t-2 border-(--status-refund)">

        <div className="flex justify-between gap-4 p-3 py-5">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <Image
                width={40}
                height={40}
                src={"/icons/bermalam.svg"}
                alt="bermalam-svg"
              />
              <h4 className="font-bold text-xl">Bermalam</h4>
            </div>
            <q>Karena dimanapun kamu berada, <br />kamu pasti membutuhkan tempat untuk bermalam</q>
          </div>

          <div className="flex flex-col gap-2.5">
            <h4 className="font-bold">Halaman Yang Kamu Butuhkan</h4>
            <div className="flex flex-col gap-1.5">
              <Link href={"/"}>Halaman Utama </Link>
              <Link href={"/"}>Hotel - Hotel</Link>
              <Link href={"/"}>Kupon & Promo</Link>
              <Link href={"/"}>Butuh Bantuan Dan Dukungan</Link>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <h4 className="font-bold">Kamu Mungkin Tertarik</h4>
            <div className="flex flex-col gap-1.5">
              <Link href={"/"}>Bermalam`s Partner</Link>
              <Link href={"/"}>Saya Ingin Mendaftarkan Properti</Link>
              <Link href={"/"}>Syarat Dan Ketentuan</Link>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <h4 className="font-bold">Temukan Kami Pada</h4>
            <div className="flex flex-col gap-1.5">
              <Link href={"/"}>Youtube</Link>
              <Link href={"/"}>Tiktok</Link>
              <Link href={"/"}>Instragam</Link>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <h4 className="font-bold">Kontak Kami</h4>
            <div className="flex flex-col gap-1.5">
              <Link href={"/"}>+62 82198291</Link>
              <Link href={"/"}>0800 - 1234 - 5678</Link>
              <Link href={"/"}>support@bermalam.id</Link>
            </div>
          </div>
        </div>

        <p className="w-full text-center p-2">&#169; Bermalam All Right Reserved 2026</p>


      </footer>
}