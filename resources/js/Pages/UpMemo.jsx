import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import axios from "axios";
import Select from "react-select";
import { Button, IconButton } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import { blue } from "@mui/material/colors";
import { usePage } from "@inertiajs/react";
import { useForm } from "laravel-precognition-react-inertia";

const UpMemo = (props) => {
    const labels = props.labels;
    const maxImagesUpload = 20;
    const inputId = Math.random().toString(32).substring(2);
    const key = usePage().props.API;
    const googleUrl = `https://vision.googleapis.com/v1/images:annotate?key=${key}`;
    const [images, setImages] = useState([]);
    const [texts, setTexts] = useState([]);
    // const [labels, setLabels] = useState([]);
    const [selectLabels, setSelectLabels] = useState([]);
    const [date, setDate] = useState(new Date().toISOString());

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        const postData = {};

        images.forEach((image, index) => {
            let array = {};
            array.text = texts[index];
            array.date = new Date(date).toISOString();
            array.label = selectLabels[index]
                ? selectLabels[index].value
                : "デフォルト値";
            postData[index] = array;
        });

        try {
            await axios.post(route("memos.store"), postData, {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Error calling the Vision API", error);
            console.error("Response from Vision API:", error.response);
            setTexts((prevText) => [...prevText, null]);
        }

        setImages([]);
        setTexts([]);
        setSelectLabels([]);
    };

    const handleOnAddImage = async (e) => {
        if (!e.target.files) return;
        setImages((prevImages) => [...prevImages, ...e.target.files]);
        Promise.all(
            [...e.target.files].map((file, index) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const baseImage = reader.result.replace(/d.*?,/, "");
                    createTexts(baseImage, index, key);
                };
            })
        );
    };

    const handleChangeLabel = async (e, index) => {
        let newSelectLabels = [...selectLabels];
        if (newSelectLabels.length == 0) {
            newSelectLabels = new Array(images.length);
        }
        newSelectLabels.splice(index, 1, e);
        setSelectLabels(newSelectLabels);
    };

    const createTexts = async (baseImage, index, key) => {
        const googleUrl = `https://vision.googleapis.com/v1/images:annotate?key=${key}`;
        const request = {
            requests: [
                {
                    image: {
                        content: baseImage,
                    },
                    features: [
                        {
                            type: "LABEL_DETECTION",
                            maxResults: 1,
                        },
                        {
                            type: "TEXT_DETECTION",
                            maxResults: 10,
                        },
                    ],
                },
            ],
        };

        try {
            const response = await axios.post(googleUrl, request);
            const newText = response.data.responses[0].fullTextAnnotation.text;
            setTexts((prevTexts) => {
                const newTexts = [...prevTexts];
                newTexts[index] = newText;
                return newTexts;
            });
        } catch (error) {
            console.error("Error calling the Vision API", error);
            console.error("Response from Vision API:", error.response);
            setTexts((prevText) => [...prevText, null]);
        }
    };

    const handleOnRemoveImageObject = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newSelectLabels = [...selectLabels];
        newSelectLabels.splice(index, 1);
        setSelectLabels(newSelectLabels);
    };

    return (
        <AuthenticatedLayout
            user={props.auth.user}
            header={
                <h2 className="font-semibold text-2xl leading-tight">
                    Memo Up
                </h2>
            }
        >
            <div className="h-full max-w-7xl mx-auto sm:px-6 lg:px-8 flex justify-center items-center">
                <div>
                    <div className="flex justify-center">
                        <PhotoLibraryIcon
                            sx={{
                                fontSize: 200,
                                color: blue[400],
                                opacity: 0.2,
                            }}
                        />
                    </div>
                    <p className="my-3 text-center">
                        Please choose file to upload your files
                    </p>
                    <form action="" onSubmit={(e) => handleOnSubmit(e)}>
                        {images.length == 0 ? (
                            <div>
                                <label htmlFor={inputId}>
                                    <div className="my-3 flex justify-center">
                                        <Button
                                            sx={{
                                                fontSize: "14px",
                                                fontWeight: "bold",
                                                padding: "10px 20px",
                                            }}
                                            variant="contained"
                                            disabled={
                                                images.length >= maxImagesUpload
                                            }
                                            component="span"
                                        >
                                            Select Image
                                        </Button>
                                    </div>
                                    <input
                                        id={inputId}
                                        type="file"
                                        multiple
                                        accept="image/*,.png,.jpg,.jpeg,.gif"
                                        onChange={(e) => handleOnAddImage(e)}
                                        style={{ display: "none" }}
                                    />
                                </label>
                            </div>
                        ) : (
                            <div>
                                <div className="flex justify-around">
                                    <label htmlFor={inputId}>
                                        <div className="my-3 flex justify-center">
                                            <Button
                                                sx={{
                                                    fontSize: "14px",
                                                    fontWeight: "bold",
                                                    padding: "10px 20px",
                                                }}
                                                variant="contained"
                                                disabled={
                                                    images.length >=
                                                    maxImagesUpload
                                                }
                                                component="span"
                                            >
                                                Select Image
                                            </Button>
                                        </div>
                                        <input
                                            id={inputId}
                                            type="file"
                                            multiple
                                            accept="image/*,.png,.jpg,.jpeg,.gif"
                                            onChange={(e) =>
                                                handleOnAddImage(e)
                                            }
                                            style={{ display: "none" }}
                                        />
                                    </label>
                                    <div className="my-3 flex justify-center">
                                        <Button
                                            sx={{
                                                fontSize: "14px",
                                                fontWeight: "bold",
                                                padding: "10px 20px",
                                            }}
                                            variant="contained"
                                            type="submit"
                                        >
                                            Up Image
                                        </Button>
                                    </div>
                                </div>
                                <div className="mx-auto">
                                    {images?.map((image, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                position: "relative",
                                                width: "80%",
                                            }}
                                            className="mx-auto mb-2"
                                        >
                                            <IconButton
                                                aria-label="delete image"
                                                style={{
                                                    position: "absolute",
                                                    top: 10,
                                                    left: 10,
                                                    color: "#aaa",
                                                }}
                                                onClick={() =>
                                                    handleOnRemoveImageObject(i)
                                                }
                                            >
                                                <CancelIcon />
                                            </IconButton>
                                            <img
                                                src={URL.createObjectURL(image)}
                                                style={{
                                                    width: "100%",
                                                }}
                                            />
                                            <div className="flex">
                                                <Select
                                                    options={labels}
                                                    onChange={(e) =>
                                                        handleChangeLabel(e, i)
                                                    }
                                                    required
                                                    styles={{
                                                        control: (
                                                            provided,
                                                            state
                                                        ) => ({
                                                            ...provided,
                                                            boxShadow: "none",
                                                            border: "none",
                                                            color: "#000000",
                                                            width: "100%",
                                                        }),
                                                        option: (
                                                            provided,
                                                            state
                                                        ) => ({
                                                            ...provided,
                                                            color: "#000000",
                                                            backgroundColor:
                                                                state.isSelected
                                                                    ? "#00AEEC"
                                                                    : "inherit",
                                                        }),
                                                    }}
                                                />
                                                <div>
                                                    {/* <DatePicker
                                                    onChange={(newDate) => setDate(new Date(newDate).toISOString())}
                                                    value={new Date(date)}
                                                /> */}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="my-3 flex justify-center">
                                    <Button
                                        sx={{
                                            fontSize: "14px",
                                            fontWeight: "bold",
                                            padding: "10px 20px",
                                        }}
                                        variant="contained"
                                        type="submit"
                                    >
                                        Up Image
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default UpMemo;
