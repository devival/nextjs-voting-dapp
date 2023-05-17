import Link from "next/link"

export default function Footer() {
    return (
        <nav className="p-5 border-b-2 flex flex-row justify-between items-center">
            <h1 className="py-4 px-4 font-bold text-2xl">Deployed to Sepolia Network</h1>
            <div className="flex flex-row items-center">
                <Link href="https://sepolia.etherscan.io/address/0xea180f4cbcadb849fc2747cc213837c3aace59af">
                    <a className="mr-4 p-6">Contract Address</a>
                </Link>
                <Link href="https://github.com/devival/">
                    <a className="mr-4 p-6">Author</a>
                </Link>
                <Link href="https://github.com/devival/nextjs-voting-dapp">
                    <a className="mr-4 p-6">GitHub Repo</a>
                </Link>
                <a className="mr-4 p-6">
                    All of the votes and candidate registration happen on chain
                </a>
            </div>
        </nav>
    )
}
