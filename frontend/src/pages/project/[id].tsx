import Button from "@/components/Button";
import ErrorMsg from "@/components/ErrorMsg";
import FileInput from "@/components/FileInput";
import Loading from "@/components/Loading";
import Nav from "@/components/Nav";
import Section from "@/components/Section";
import TextInput from "@/components/TextInput";
import { upload, runBuild, download_url } from "@/utils/fetch";
import { useProjectStatus } from "@/utils/hook";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

export default function Project() {
  const router = useRouter();
  const { id } = router.query;
  const project_id = id as string;

  const [step, setStep] = useState(-1);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [author, setAuthor] = useState("");
  const [version, setVersion] = useState("");
  const [desc, setDesc] = useState("");

  const [downloadUrl, setDownloadUrl] = useState("");

  const asciiAlphanumericRule = useMemo(() => new RegExp("^[A-Za-z\-0-9]*$"), []);
  const versionRule = useMemo(() => new RegExp("^[0-9\.]*$"), []);

  function handleUploadClick() {
    if (file == null) return;

    setWaiting(true);
    upload(
      project_id,
      file
    )
      .then(() => {
        setError("");
        setStep(1);
      })
      .catch(err => setError(`${err}`))
      .finally(() => setWaiting(false))
  }
  function handleBuildClick() {
    setWaiting(true);
    runBuild(project_id, { name, nameEn, author, version, desc })
      .then(() => {
        setError("");
        setStep(2);
      })
      .catch(err => setError(`${err}`))
      .finally(() => setWaiting(false))
  }

  const project = useProjectStatus(project_id, (step == 2 || step == -1) && !!project_id);

  useEffect(() => {
    if (project) {
      switch (project.status) {
        case 'Created':
          setStep(0);
          break;

        case 'Uploaded':
          setStep(1);
          break;

        case 'Building':
          setStep(2);
          break;

        case 'Success':
          setStep(3);
          setError("");

          setWaiting(true);
          download_url(project_id)
            .then(d => setDownloadUrl(d))
            .catch(err => setError(`${err}`))
            .finally(() => setWaiting(false))
          break;

        case 'Failed':
          setStep(3);
          setError("?????? ???????????? ????????? ??????????????????.");
          break;

        default:
          break;
      }
    }
  }, [project]);

  return (
    <>
      <Head>
        <title>?????? : ????????????</title>
        <meta name="description" content="????????? ????????? ????????? ????????? ?????? ????????? ??????????????????." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className='container mx-auto px-10'>
        <Nav />

        <Section step={0} current={step} title="????????? ?????? ?????????">
          <div>
            <FileInput onChange={f => setFile(f || null)} />
            <div className='flex gap-2'>
              <Button title='???????????????' onClick={handleUploadClick} disabled={!file || waiting} />
              <ErrorMsg error={error} />
            </div>
          </div>
        </Section>

        <Section step={1} current={step} title="?????? ?????? ??????">
          <div>
            <TextInput title='??? ??????'
              placeholder='?????? ?????? ???????????? ???????????????.'
              value={name}
              onChange={setName}
            />
            <TextInput title='??? ?????? ??????'
              placeholder='?????????, ??????, ??????(-)??? ????????? ??? ????????????.'
              value={nameEn}
              onChange={setNameEn}
              required
              validate={v => asciiAlphanumericRule.test(v)}
            />
            <TextInput title='?????????'
              placeholder='?????????, ??????, ??????(-)??? ????????? ??? ????????????.'
              value={author}
              onChange={setAuthor}
              required
              validate={v => asciiAlphanumericRule.test(v)}
            />
            <TextInput title='??????'
              placeholder='0.0.1'
              value={version}
              onChange={setVersion}
              validate={v => versionRule.test(v)}
            />
            <TextInput title='?????? ??????'
              placeholder='?????? ????????? ??????'
              value={desc}
              onChange={setDesc}
            />
            <div className='text-sm'>
              '<span className="text-red-400">*</span>' ????????? ?????? ????????? ????????? ???????????? ?????????.
            </div>
            <div className='flex gap-2'>
              <Button title='??????' outline onClick={() => setStep(0)} />
              <Button title='????????????' onClick={handleBuildClick} disabled={!nameEn || !author || waiting} />
              <ErrorMsg error={error} />
            </div>
          </div>
        </Section>

        <Section step={2} current={step} title="????????????">
          <div className="flex align-middle">
            <div className="mx-10">
              <Loading />
            </div>
            <div>
              <div>????????? ????????? ????????? ????????? ??????????????????.</div>
              <div>?????? 2~6?????? ???????????????.</div>
              <div>??????: {project?.status}</div>
              <ErrorMsg error={error} />
            </div>
          </div>
        </Section>

        <Section step={3} current={step} title="?????? ?????? ????????????">
          <div>
            <div className='flex gap-2'>
              {
                error
                  ? <ErrorMsg error={error} />
                  : <Button title='????????????' onClick={() => window.open(downloadUrl)} />
              }
            </div>
          </div>
        </Section>
      </div>
    </>
  )
}