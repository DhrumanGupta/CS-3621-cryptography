"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { decrypt, keygen } from "@/encryption/lwe";
import { Ciphertext, PublicKey, SecretKey } from "@/encryption/types";
import { findPrimeInRange } from "@/encryption/utils";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [n, setN] = useState<string>("");
  const [q, setQ] = useState<number | null>(null);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [secretKey, setSecretKey] = useState<SecretKey | null>(null);
  const [showPublicKey, setShowPublicKey] = useState<boolean>(false);
  const [showSecretKey, setShowSecretKey] = useState<boolean>(false);
  const [ciphertextsJson, setCiphertextsJson] = useState<string>("");
  const [decryptedBits, setDecryptedBits] = useState<string | null>(null);

  const handleGenerateQ = () => {
    const nValue = parseInt(n, 10);
    if (isNaN(nValue) || nValue <= 0) {
      toast.error("Please enter a valid positive integer for n");
      return;
    }

    const lowerBound = nValue * nValue;
    const upperBound = 2 * nValue * nValue;
    const prime = findPrimeInRange(lowerBound, upperBound);

    if (prime === null) {
      toast.error(`No prime found in range [${lowerBound}, ${upperBound}]`);
      return;
    }

    setQ(prime);
    // Reset keys when q changes
    setPublicKey(null);
    setSecretKey(null);
    setDecryptedBits(null);
    setCiphertextsJson("");
    toast.success(`Prime q = ${prime} generated successfully`);
  };

  const handleGenerateKey = () => {
    if (q === null) {
      toast.error("Please generate q first");
      return;
    }

    const nValue = parseInt(n, 10);
    if (isNaN(nValue) || nValue <= 0) {
      toast.error("Please enter a valid positive integer for n");
      return;
    }

    try {
      const { secret, publicKey: pk } = keygen(nValue, q);
      setSecretKey(secret);
      setPublicKey(pk);
      // Reset expanded states when new keys are generated
      setShowPublicKey(false);
      setShowSecretKey(false);
      setDecryptedBits(null);
      setCiphertextsJson("");
      toast.success("Keys generated successfully");
    } catch (error) {
      toast.error(
        `Error generating key: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch {
      toast.error(`Failed to copy ${label} to clipboard`);
    }
  };

  const handleCopyPublicKey = () => {
    if (publicKey !== null) {
      copyToClipboard(JSON.stringify(publicKey, null, 2), "Public Key");
    }
  };

  const handleCopySecretKey = () => {
    if (secretKey !== null) {
      copyToClipboard(JSON.stringify(secretKey, null, 2), "Secret Key");
    }
  };

  const validateCiphertexts = (jsonStr: string): Ciphertext[] | null => {
    try {
      const parsed = JSON.parse(jsonStr);
      // Validate that it's an array
      if (!Array.isArray(parsed)) {
        return null;
      }
      // Validate that each element has the structure of a Ciphertext
      for (const item of parsed) {
        if (
          !item ||
          !Array.isArray(item.vector) ||
          typeof item.scalar !== "number"
        ) {
          return null;
        }
      }
      return parsed as Ciphertext[];
    } catch {
      return null;
    }
  };

  const handleDecrypt = () => {
    if (secretKey === null) {
      toast.error("Please generate keys first");
      return;
    }

    if (!ciphertextsJson.trim()) {
      toast.error("Please enter ciphertexts JSON");
      return;
    }

    const ciphertexts = validateCiphertexts(ciphertextsJson.trim());
    if (!ciphertexts) {
      toast.error(
        "Invalid ciphertexts JSON. Please check the format (should be an array of objects with 'vector' and 'scalar' fields)."
      );
      return;
    }

    try {
      const bits: number[] = [];
      for (const ciphertext of ciphertexts) {
        const bit = decrypt(secretKey, ciphertext);
        bits.push(bit);
      }
      const binaryString = bits.join("");
      setDecryptedBits(binaryString);
      toast.success(`Successfully decrypted ${bits.length} bit(s)`);
    } catch (error) {
      toast.error(
        `Error during decryption: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const handleCopyDecryptedBits = () => {
    if (decryptedBits !== null) {
      copyToClipboard(decryptedBits, "Decrypted Bits");
    }
  };

  return (
    <div className="flex grow items-center justify-center p-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>LWE Key Generation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="n-input">n</Label>
            <Input
              id="n-input"
              type="number"
              placeholder="Enter a positive integer"
              value={n}
              onChange={(e) => setN(e.target.value)}
              min="1"
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleGenerateQ}
              disabled={!n || parseInt(n, 10) <= 0}
            >
              Generate q
            </Button>
          </div>

          {q !== null && (
            <div className="space-y-2">
              <Label>q (generated prime)</Label>
              <div className="p-3 rounded-md bg-muted text-muted-foreground font-mono">
                {q}
              </div>
            </div>
          )}

          {q !== null && (
            <div className="flex gap-4">
              <Button onClick={handleGenerateKey}>Generate Key</Button>
            </div>
          )}

          {publicKey !== null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Public Key</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPublicKey(!showPublicKey)}
                  >
                    {showPublicKey ? "Hide" : "Show"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPublicKey}
                  >
                    Copy to Clipboard
                  </Button>
                </div>
              </div>
              {showPublicKey && (
                <pre className="p-3 rounded-md bg-muted text-muted-foreground font-mono text-sm overflow-auto max-h-96">
                  {JSON.stringify(publicKey, null, 2)}
                </pre>
              )}
            </div>
          )}

          {secretKey !== null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Secret Key</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                  >
                    {showSecretKey ? "Hide" : "Show"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopySecretKey}
                  >
                    Copy to Clipboard
                  </Button>
                </div>
              </div>
              {showSecretKey && (
                <pre className="p-3 rounded-md bg-muted text-muted-foreground font-mono text-sm overflow-auto">
                  {JSON.stringify(secretKey, null, 2)}
                </pre>
              )}
            </div>
          )}

          {secretKey !== null && (
            <>
              <div className="space-y-2">
                <Label htmlFor="ciphertexts-input">Ciphertexts (JSON)</Label>
                <textarea
                  id="ciphertexts-input"
                  placeholder='Paste encrypted ciphertexts JSON array, e.g., [{"vector": [...], "scalar": 42}, ...]'
                  value={ciphertextsJson}
                  onChange={(e) => setCiphertextsJson(e.target.value)}
                  className={cn(
                    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-mono",
                    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                    "min-h-[120px] resize-y"
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleDecrypt}
                  disabled={!ciphertextsJson.trim()}
                >
                  Decrypt
                </Button>
              </div>

              {decryptedBits !== null && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Decrypted Bits</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyDecryptedBits}
                    >
                      Copy to Clipboard
                    </Button>
                  </div>
                  <div className="p-3 rounded-md bg-muted text-muted-foreground font-mono break-all">
                    {decryptedBits}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
